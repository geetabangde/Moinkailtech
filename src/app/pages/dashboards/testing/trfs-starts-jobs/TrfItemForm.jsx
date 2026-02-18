import { useState, useEffect, useCallback, useRef } from "react";
import axios from "utils/axios";

// ─── Constants ────────────────────────────────────────────────────────────────
const SEALED_OPTIONS = [
  { value: 0, label: "Unsealed" },
  { value: 1, label: "Sealed" },
  { value: 2, label: "Packed" },
  { value: 3, label: "NA" },
];

const INITIAL_FORM = {
  product: "",
  brand: "",
  qrcode: "",
  testrequest: "",
  grade: "",
  size: "",
  package: "",
  package_type: 1,
  isok: "",
  sealed: 0,
  disposable: "",
  condition: "",
  specification: "",
  conformity: "",
  unitcost: 0,
  total: 0,
};

// ─── Helper: extract array from any API response shape ───────────────────────
const extractArray = (res, ...keys) => {
  const d = res.data;
  for (const k of keys) if (Array.isArray(d?.[k])) return d[k];
  if (Array.isArray(d?.data)) return d.data;
  if (Array.isArray(d)) return d;
  return [];
};

/**
 * Props:
 *   trfId      — TRF ID (from parent)
 *   itemId     — null = Add New, number = Edit existing
 *   onSuccess  — called after successful submit
 *   onCancel   — called when user cancels
 */
export default function TrfItemForm({ trfId, itemId, onSuccess, onCancel }) {
  const isNew = !itemId;

  // ─── Static dropdowns ────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [grades, setGrades] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [choices, setChoices] = useState([]);
  const [disposables, setDisposables] = useState([]);
  const [conditions, setConditions] = useState([]);

  // ─── Dynamic: packages depend on selected product ────────────────────────
  const [packages, setPackages] = useState([]);
  const [loadingPkgList, setLoadingPkgList] = useState(false);

  // ─── Dynamic: quantities/price/params depend on selected package ─────────
  // quantities[] = packagequantity rows: { id, name, quantity, unit }
  // received[]   = parallel user-input values (index-matched)
  // parameters[] = packageparameters rows: { id, name, description }
  //                NOTE: id = packageparameters.id  (NOT parameters.id)
  //                PHP: name="parameters[]" value="<?= $irow['id'] ?>"
  const [quantities, setQuantities] = useState([]);
  const [received, setReceived] = useState([]);
  const [parameters, setParameters] = useState([]);
  const [selectedParams, setSelectedParams] = useState([]); // packageparameters.id list
  const [isSpecial, setIsSpecial] = useState(false);
  const [loadingPkgDetails, setLoadingPkgDetails] = useState(false);

  // ─── Form state ──────────────────────────────────────────────────────────
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // ── 1. Load static dropdowns ─────────────────────────────────────────────
  const fetchDropdowns = useCallback(async () => {
    setLoadingDropdowns(true);
    try {
      const [prodRes, gradeRes, sizeRes, choiceRes, dispRes, condRes] =
        await Promise.all([
          axios.get("/testing/get-prodcut-list"),
          axios.get("/testing/get-grades"),
          axios.get("/testing/get-sizes"),
          axios.get("/get-choices"),
          axios.get("/testing/get-disposables-list"),
          axios.get("/testing/get-conditions-list"),
        ]);

      setProducts(extractArray(prodRes, "products", "data"));
      setGrades(extractArray(gradeRes, "grades", "data"));
      setSizes(extractArray(sizeRes, "sizes", "data"));
      setChoices(extractArray(choiceRes, "choices", "data"));
      setDisposables(extractArray(dispRes, "disposables", "data"));
      setConditions(extractArray(condRes, "conditions", "data"));
    } catch {
      setSubmitError("Failed to load form options. Please refresh.");
    } finally {
      setLoadingDropdowns(false);
    }
  }, []);

  // ── 2. Load existing item for edit ───────────────────────────────────────
  const fetchItem = useCallback(async () => {
    if (isNew) return;
    try {
      const res = await axios.get(`testing/get-trf-item/${itemId}`);
      const item = res.data?.item ?? res.data?.data ?? res.data ?? {};
      setForm({
        product: item.product ?? "",
        brand: item.brand ?? "",
        qrcode: item.qrcode ?? "",
        testrequest: item.testrequest ?? "",
        grade: item.grade ?? "",
        size: item.size ?? "",
        package: item.package ?? "",
        package_type: item.package_type ?? 1,
        isok: item.isok ?? "",
        sealed: item.sealed ?? 0,
        disposable: item.disposable ?? "",
        condition: item.condition ?? "",
        specification: item.specification ?? "",
        conformity: item.conformity ?? "",
        unitcost: item.unitcost ?? 0,
        total: item.total ?? 0,
      });
    } catch {
      setSubmitError("Failed to load item details.");
    }
  }, [isNew, itemId]);

  useEffect(() => {
    fetchDropdowns();
    fetchItem();
  }, [fetchDropdowns, fetchItem]);

  // ── 3. Set first-option defaults once dropdowns load ─────────────────────
  useEffect(() => {
    if (!loadingDropdowns && isNew) {
      setForm((prev) => ({
        ...prev,
        isok: prev.isok || (choices[0]?.id ?? ""),
        disposable: prev.disposable || (disposables[0]?.id ?? ""),
        condition: prev.condition || (conditions[0]?.id ?? ""),
        specification: prev.specification || (choices[0]?.id ?? ""),
        conformity: prev.conformity || (choices[0]?.id ?? ""),
        grade: prev.grade || (grades[0]?.id ?? ""),
        size: prev.size || (sizes[0]?.id ?? ""),
      }));
    }
  }, [loadingDropdowns, isNew, choices, disposables, conditions, grades, sizes]);

  // ── 4. Product change → fetch package list ───────────────────────────────
  // GET /testing/get-package-list?pid={productId}
  // Response: { status, data: [{id, package, rate, nabl, type}] }
  const prevProduct = useRef(null);
  useEffect(() => {
    const pid = form.product;
    if (!pid || pid === prevProduct.current) return;
    prevProduct.current = pid;

    setPackages([]);
    setForm((prev) => ({ ...prev, package: "", unitcost: 0, total: 0, package_type: 1 }));
    setQuantities([]);
    setReceived([]);
    setParameters([]);
    setSelectedParams([]);
    setIsSpecial(false);

    const loadPackages = async () => {
      setLoadingPkgList(true);
      try {
        const res = await axios.get(`testing/get-package-list?pid=${pid}`);
        const list = extractArray(res, "data");
        setPackages(list);
      } catch {
        /* silent */
      } finally {
        setLoadingPkgList(false);
      }
    };

    loadPackages();
  }, [form.product, isNew]);

  // ── 5. Package change → fetch quantities, price (with special price), parameters
  // PHP fetchquantities.php  → packagequantity table → quantities[] + received[]
  // PHP fetchpprice.php      → testprices + specialprices → unitcost / total
  // PHP fetchparameters.php  → packageparameters table → parameters[] (id = packageparameters.id)
  const prevPkg = useRef(null);
  useEffect(() => {
    const pkgId = form.package;
    if (!pkgId || pkgId === prevPkg.current) return;
    prevPkg.current = pkgId;

    // Pre-fill unitcost from package list rate (will be overridden by API)
    const selectedPkg = packages.find((p) => String(p.id) === String(pkgId));
    if (selectedPkg?.rate !== undefined) {
      setForm((prev) => ({ ...prev, unitcost: selectedPkg.rate, total: selectedPkg.rate }));
    }

    const loadPkgDetails = async () => {
      setLoadingPkgDetails(true);
      try {
        const [qtyRes, priceRes, paramRes] = await Promise.all([
          // fetchquantities.php logic: packagequantity where package=$pid
          axios.get(`testing/get-package-quantities/${pkgId}`),
          // fetchpprice.php logic: checks specialprices first, then testprices.rate
          // trfId needed so backend can look up customer for special price
          axios.get(`testing/get-package-price/${pkgId}/${trfId}`),
          // fetchparameters.php logic: packageparameters where package=$pid
          // Returns: { special: 0|1, data: [{id: packageparameters.id, name, description}] }
          axios.get(`testing/get-package-parameters/${pkgId}`),
        ]);

        // ── DEBUG: Remove after confirming keys ──────────────────
        console.log("QTY raw response:", qtyRes.data);
        console.log("PRICE raw response:", priceRes.data);
        console.log("PARAM raw response:", paramRes.data);
        // ─────────────────────────────────────────────────────────

        // Quantities — from packagequantity table
        // Trying all possible key names the API might return
        const qtys = extractArray(
          qtyRes,
          "quantities", "packagequantity", "packageQuantity",
          "qty", "items", "list", "data"
        );

        // Price
        const price =
          priceRes.data?.unitcost ??
          priceRes.data?.rate ??
          priceRes.data?.price ??
          priceRes.data?.data?.unitcost ??
          priceRes.data?.data?.rate ??
          selectedPkg?.rate ??
          0;

        // Package type
        const pkgType =
          priceRes.data?.package_type ??
          priceRes.data?.type ??
          priceRes.data?.packageType ??
          priceRes.data?.data?.package_type ??
          1;

        // Parameters — fetchparameters.php:
        // special=1 → show checkboxes with name="parameters[]" value=packageparameters.id
        // special=0 → no checkboxes shown, all parameters auto-included
        const params = extractArray(
          paramRes,
          "parameters", "packageparameters", "packageParameters",
          "params", "items", "list", "data"
        );
        const special =
          paramRes.data?.special ??
          paramRes.data?.is_special ??
          paramRes.data?.isSpecial ??
          paramRes.data?.data?.special ??
          false;

        setQuantities(qtys);
        setReceived(qtys.map(() => ""));
        setForm((prev) => ({ ...prev, unitcost: price, total: price, package_type: pkgType }));
        setParameters(params);
        setIsSpecial(!!special);

        // PHP default: all checkboxes pre-checked (checked='checked')
        // So selectedParams = all packageparameters.id by default when special
        setSelectedParams(special ? params.map((p) => p.id) : []);
      } catch {
        /* silent */
      } finally {
        setLoadingPkgDetails(false);
      }
    };

    loadPkgDetails();
  }, [form.package, packages, trfId]);

  // ── 6. Recalculate total when received qty changes ────────────────────────
  // PHP: totalaqty() → sum all .receivedquantities → totalqty
  // total = sum(received) * unitcost
  useEffect(() => {
    const totalQty = received.reduce((sum, v) => sum + (Number(v) || 0), 0);
    if (totalQty > 0) {
      setForm((prev) => ({
        ...prev,
        total: totalQty * (Number(prev.unitcost) || 0),
      }));
    }
  }, [received]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleReceivedChange = (index, value) => {
    setReceived((prev) => {
      const n = [...prev];
      n[index] = value;
      return n;
    });
  };

  // PHP: checkall('selectall','parametercheck') → toggle all
  const handleSelectAllParams = (checked) => {
    setSelectedParams(checked ? parameters.map((p) => p.id) : []);
  };

  // PHP: name="parameters[]" value="<?= $irow['id'] ?>" → packageparameters.id
  const handleParamToggle = (paramId) => {
    setSelectedParams((prev) =>
      prev.includes(paramId) ? prev.filter((p) => p !== paramId) : [...prev, paramId]
    );
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const required = [
      "product", "brand", "qrcode", "testrequest",
      "grade", "size", "package",
      "isok", "disposable", "condition", "specification", "conformity",
    ];
    const errs = {};
    required.forEach((f) => {
      if (form[f] === "" || form[f] === null || form[f] === undefined)
        errs[f] = "Required";
    });
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  // Matches inserttrfitem.php POST structure exactly:
  // quantities[]  = packagequantity.id array
  // received[]    = user-entered values (index-matched)
  // parameters[]  = packageparameters.id array (only when special=1)
  // id / hakuna   = trfId
  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        product: Number(form.product),
        brand: form.brand,
        qrcode: form.qrcode,
        testrequest: form.testrequest,
        package_type: Number(form.package_type), // PHP unsets this before DB insert
        grade: Number(form.grade),
        size: Number(form.size),
        package: Number(form.package),
        isok: Number(form.isok),
        sealed: Number(form.sealed),
        disposable: Number(form.disposable),
        condition: Number(form.condition),
        specification: Number(form.specification),
        conformity: Number(form.conformity),
        unitcost: Number(form.unitcost),
        total: Number(form.total),
        // PHP: foreach ($quantities as $quantity) with $received[$hakuna]
        quantities: quantities.map((q) => q.id),
        received: received.map((r) => Number(r) || 0),
        // PHP: $_POST['hakuna'] = trfId
        id: Number(trfId),
        // PHP: if (!empty($parameter) && $special) → in_array($pararow['id'], $parameter)
        // Only send when special=1 AND at least one selected
        ...(isSpecial && selectedParams.length
          ? { parameters: selectedParams }
          : {}),
      };
      await axios.post("testing/add-trf-item", payload);
      onSuccess?.();
    } catch (err) {
      setSubmitError(err?.response?.data?.message ?? "Failed to save item.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (loadingDropdowns) {
    return <div style={s.loadingWrap}>Loading form options…</div>;
  }

  const allParamsSelected =
    parameters.length > 0 && selectedParams.length === parameters.length;

  return (
    <div style={s.wrapper}>
      <div style={s.formTitle}>
        {isNew ? "Add New Item" : `Edit Item #${itemId}`}
      </div>

      {submitError && <div style={s.errorBanner}>{submitError}</div>}

      {/* ════ SECTION 1 — Product ════ */}
      <div style={s.row}>
        <Field label="Product" required error={errors.product} flex="1 1 100%">
          <select
            name="product"
            style={inp(errors.product)}
            value={form.product}
            onChange={handleChange}
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.description ? `(${p.description})` : ""}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div style={s.row}>
        <Field label="Brand/Source" required error={errors.brand}>
          <input
            name="brand"
            style={inp(errors.brand)}
            value={form.brand}
            onChange={handleChange}
            placeholder="Brand/Source"
          />
        </Field>
        <Field label="QR Code" required error={errors.qrcode}>
          <input
            name="qrcode"
            style={inp(errors.qrcode)}
            value={form.qrcode}
            onChange={handleChange}
            placeholder="Qr Code"
          />
        </Field>
        <Field label="Test Request" required error={errors.testrequest}>
          <input
            name="testrequest"
            style={inp(errors.testrequest)}
            value={form.testrequest}
            onChange={handleChange}
            placeholder="Test Request"
          />
        </Field>
      </div>

      <div style={s.divider} />

      {/* ════ SECTION 2 — Package Type, Grade, Size ════ */}
      <div style={s.row}>
        {/* Package Type — from testprices.type via fetchpprice.php */}
        <Field label="Packages Type" flex="1 1 200px">
          <select
            name="package_type"
            style={s.inputBase}
            value={form.package_type}
            onChange={handleChange}
          >
            <option value={1}>NABL</option>
            <option value={0}>Non-NABL</option>
            <option value={3}>QAI</option>
          </select>
        </Field>
        <Field label="Grades" required error={errors.grade} flex="1 1 200px">
          <select
            name="grade"
            style={inp(errors.grade)}
            value={form.grade}
            onChange={handleChange}
          >
            <option value="">Select Grade</option>
            {grades.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
                {g.description ? ` — ${g.description}` : ""}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div style={s.row}>
        <Field label="Sizes" required error={errors.size}>
          <select
            name="size"
            style={inp(errors.size)}
            value={form.size}
            onChange={handleChange}
          >
            <option value="">Select Size</option>
            {sizes.map((sz) => (
              <option key={sz.id} value={sz.id}>
                {sz.name}
                {sz.description ? ` — ${sz.description}` : ""}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Package — depends on selected product */}
      <div style={s.row}>
        <Field label="Packages" required error={errors.package} flex="1 1 100%">
          {loadingPkgList ? (
            <div style={s.pkgLoading}>Loading packages…</div>
          ) : (
            <select
              name="package"
              style={inp(errors.package)}
              value={form.package}
              onChange={handleChange}
              disabled={!form.product}
            >
              <option value="">
                {form.product ? "Select Package" : "Select a Product first"}
              </option>
              {packages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.package}
                  {p.nabl ? " (NABL)" : ""}
                </option>
              ))}
            </select>
          )}
        </Field>
      </div>

      {/* ════ SECTION 3 — isOk, Sealed, Disposable ════ */}
      <div style={s.row}>
        <Field label="isOk" required error={errors.isok}>
          <select
            name="isok"
            style={inp(errors.isok)}
            value={form.isok}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {choices.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Sealed?">
          <select
            name="sealed"
            style={s.inputBase}
            value={form.sealed}
            onChange={handleChange}
          >
            {SEALED_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Disposable" required error={errors.disposable}>
          <select
            name="disposable"
            style={inp(errors.disposable)}
            value={form.disposable}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {disposables.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div style={s.divider} />

      {/* ════ SECTION 4 — Condition, Specification, Conformity ════ */}
      <div style={s.row}>
        <Field label="Condition" required error={errors.condition}>
          <select
            name="condition"
            style={inp(errors.condition)}
            value={form.condition}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {conditions.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Specification" required error={errors.specification}>
          <select
            name="specification"
            style={inp(errors.specification)}
            value={form.specification}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {choices.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Conformity" required error={errors.conformity}>
          <select
            name="conformity"
            style={inp(errors.conformity)}
            value={form.conformity}
            onChange={handleChange}
          >
            <option value="">Select</option>
            {choices.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* ════ SECTION 5 — Price (fetchpprice.php) ════ */}
      {/* PHP: echo "<input type='hidden' name='unitcost' value='$price'/> ₹ $price" */}
      {!loadingPkgDetails && form.package && (
        <div style={s.priceRow}>
          <span style={s.priceLabel}>₹ {Number(form.unitcost).toLocaleString("en-IN")}</span>
          <input type="hidden" name="unitcost" value={form.unitcost} />
          <input type="hidden" name="total" value={form.total} />
          {form.total !== form.unitcost && (
            <span style={s.totalLabel}>
              Total: ₹ {Number(form.total).toLocaleString("en-IN")}
            </span>
          )}
        </div>
      )}

      {/* ════ SECTION 6 — Quantities (fetchquantities.php) ════ */}
      {/* PHP layout: Required Quantity (left col) | Received Quantity (right col) */}
      {loadingPkgDetails && (
        <div style={s.pkgLoading}>Loading package details…</div>
      )}

      {!loadingPkgDetails && quantities.length > 0 && (
        <div style={s.qtyBox}>
          {/* Header row */}
          <div style={s.qtyHeaderRow}>
            <div style={{ ...s.qtyCol, fontWeight: 700, color: "#475569" }}>
              Required Quantity
            </div>
            <div style={{ ...s.qtyCol, fontWeight: 700, color: "#475569" }}>
              Received Quantity
            </div>
          </div>

          {/* PHP: while($irow) → name/quantity/unit | input received[] */}
          {quantities.map((qty, idx) => (
            <div key={qty.id} style={s.qtyRow}>
              {/* Left: label — PHP: $irow['name']." ".$irow['quantity']." ".$uname */}
              <div style={s.qtyCol}>
                <input type="hidden" name="quantities[]" value={qty.id} />
                <span style={s.qtyLabel}>
                  {qty.name}
                  {qty.quantity ? ` ${qty.quantity}` : ""}
                  {qty.unit_name ? ` ${qty.unit_name}` : qty.unit ? ` (${qty.unit})` : ""}
                </span>
              </div>
              {/* Right: PHP → class="receivedquantities" onkeyup="totalaqty()" */}
              <div style={s.qtyCol}>
                <input
                  type="number"
                  min="0"
                  className="receivedquantities"
                  style={s.inputBase}
                  value={received[idx] ?? ""}
                  onChange={(e) => handleReceivedChange(idx, e.target.value)}
                  placeholder={`enter value in ${qty.unit_name || qty.unit || "No"}`}
                />
              </div>
            </div>
          ))}

          {/* Total Quantity row — PHP: id="totalqty" readonly */}
          <div style={s.qtyRow}>
            <div style={s.qtyCol}>
              <span style={s.qtyLabel}>Total Quantity</span>
            </div>
            <div style={s.qtyCol}>
              <input
                type="number"
                id="totalqty"
                readOnly
                style={{ ...s.inputBase, background: "#f1f5f9", color: "#64748b" }}
                value={received.reduce((sum, v) => sum + (Number(v) || 0), 0)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ════ SECTION 7 — Parameters (fetchparameters.php) ════ */}
      {/* PHP: if($special) → show checkboxes, else just show names */}
      {!loadingPkgDetails && parameters.length > 0 && (
        <div style={s.paramBox}>
          <div style={s.paramTitle}>Parameters Of Package</div>

          {isSpecial && (
            /* PHP: <input type="checkbox" onclick="checkall('selectall','parametercheck')" /> Select/Deselect All */
            <label style={s.paramSelectAll}>
              <input
                type="checkbox"
                checked={allParamsSelected}
                onChange={(e) => handleSelectAllParams(e.target.checked)}
                style={{ marginRight: 6, accentColor: "#3b82f6" }}
              />
              <strong>Select/Deselect All</strong>
            </label>
          )}

          <div style={s.paramList}>
            {parameters.map((param) => (
              <div key={param.id} style={s.paramItem}>
                {isSpecial ? (
                  /* PHP: <input type="checkbox" name="parameters[]" value="<?= $irow['id'] ?>" />
                     $irow['id'] = packageparameters.id  */
                  <label style={s.paramLabel}>
                    <input
                      type="checkbox"
                      className="parametercheck"
                      checked={selectedParams.includes(param.id)}
                      onChange={() => handleParamToggle(param.id)}
                      style={{ marginRight: 6, accentColor: "#3b82f6" }}
                    />
                    {param.name}
                    {param.description ? `(${param.description})` : ""}
                  </label>
                ) : (
                  /* PHP: no checkbox, just show name */
                  <span style={s.paramLabelReadonly}>
                    {param.name}
                    {param.description ? `(${param.description})` : ""}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={s.footerRow}>
        <button style={s.cancelBtn} onClick={onCancel} disabled={submitting}>
          Cancel
        </button>
        <button
          style={{ ...s.submitBtn, ...(submitting ? s.submitDisabled : {}) }}
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Saving…" : isNew ? "Add Item" : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, required, error, children, flex }) {
  return (
    <div style={{ ...s.fieldGroup, ...(flex ? { flex } : {}) }}>
      <label style={s.fieldLabel}>
        {label}
        {required && <span style={s.star}> *</span>}
      </label>
      {children}
      {error && <span style={s.fieldErr}>{error}</span>}
    </div>
  );
}

const inp = (err) => ({ ...s.inputBase, ...(err ? s.inputErr : {}) });

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  wrapper: { fontFamily: "'Segoe UI', Arial, sans-serif", fontSize: 13, color: "#333" },
  loadingWrap: { padding: "12px 0", color: "#777", fontSize: 13 },
  formTitle: { fontSize: 15, fontWeight: 700, color: "#1e40af", marginBottom: 16 },
  errorBanner: {
    background: "#fdecea", border: "1px solid #e74c3c", color: "#c0392b",
    borderRadius: 5, padding: "8px 12px", marginBottom: 12, fontSize: 13,
  },
  divider: { borderTop: "1px dashed #cbd5e1", margin: "14px 0" },
  row: { display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 10 },
  fieldGroup: { display: "flex", flexDirection: "column", gap: 3, flex: "1 1 180px", minWidth: 0 },
  fieldLabel: { fontSize: 12, fontWeight: 600, color: "#475569" },
  star: { color: "#ef4444" },
  inputBase: {
    border: "1px solid #cbd5e1", borderRadius: 4,
    padding: "6px 9px", fontSize: 13, outline: "none",
    background: "#fff", color: "#333",
    width: "100%", boxSizing: "border-box",
  },
  inputErr: { borderColor: "#ef4444", background: "#fff5f5" },
  fieldErr: { fontSize: 11, color: "#ef4444" },
  pkgLoading: { fontSize: 12, color: "#94a3b8", padding: "6px 0" },

  // Price row — PHP: "₹ 25000" display
  priceRow: {
    display: "flex", alignItems: "center", gap: 16,
    margin: "8px 0 12px", padding: "8px 12px",
    background: "#f0fdf4", border: "1px solid #bbf7d0",
    borderRadius: 5,
  },
  priceLabel: { fontSize: 16, fontWeight: 700, color: "#166534" },
  totalLabel: { fontSize: 13, color: "#475569" },

  // Quantities — PHP two-column layout
  qtyBox: {
    border: "1px solid #cbd5e1", borderRadius: 5,
    marginBottom: 12, overflow: "hidden",
  },
  qtyHeaderRow: {
    display: "flex", background: "#f8fafc",
    padding: "8px 12px", borderBottom: "1px solid #e2e8f0",
  },
  qtyRow: {
    display: "flex", padding: "6px 12px",
    borderBottom: "1px solid #f1f5f9", alignItems: "center",
  },
  qtyCol: { flex: 1, paddingRight: 8 },
  qtyLabel: { fontSize: 13, color: "#334155" },

  // Parameters — PHP: "Parameters Of Package"
  paramBox: {
    border: "1px solid #bae6fd", borderRadius: 5,
    padding: "12px", marginBottom: 12,
    background: "#f0f9ff",
  },
  paramTitle: {
    fontSize: 13, fontWeight: 700, color: "#0369a1",
    marginBottom: 10,
  },
  paramSelectAll: {
    display: "flex", alignItems: "center",
    fontSize: 13, cursor: "pointer",
    marginBottom: 8, color: "#1e40af",
  },
  paramList: { display: "flex", flexDirection: "column", gap: 4 },
  paramItem: { fontSize: 13 },
  paramLabel: { display: "flex", alignItems: "center", cursor: "pointer", color: "#334155" },
  paramLabelReadonly: { color: "#334155" },

  footerRow: {
    display: "flex", justifyContent: "flex-end",
    gap: 8, marginTop: 16, paddingTop: 12,
    borderTop: "1px solid #e2e8f0",
  },
  cancelBtn: {
    padding: "7px 20px", background: "#fff", color: "#555",
    border: "1px solid #ccc", borderRadius: 5,
    cursor: "pointer", fontSize: 13, fontWeight: 500,
  },
  submitBtn: {
    padding: "7px 24px", background: "#3b82f6", color: "#fff",
    border: "none", borderRadius: 5, cursor: "pointer",
    fontSize: 13, fontWeight: 600,
    boxShadow: "0 2px 5px rgba(37,99,235,0.3)",
  },
  submitDisabled: { opacity: 0.6, cursor: "default" },
};