// app/utils/generateLabRoutes.js

/**
 * Generate dynamic routes for each lab
 * @param {Array} labs - Array of lab objects from API
 * @returns {Array} - Array of route objects for React Router
 */
export const generateLabRoutes = (labs) => {
  if (!labs || labs.length === 0) return [];

  // Create routes for each lab
  return labs.map((lab) => ({
    path: lab.name.toLowerCase().replace(/\s+/g, '-'), // "ssd" -> "ssd"
    children: [
      {
        path: "",
        lazy: async () => ({
          Component: (
            await import("app/pages/dashboards/material-list/electro-technical")
          ).default,
        }),
      },
      {
        path: "AddNewInstrument",
        lazy: async () => ({
          Component: (
            await import(
              "app/pages/dashboards/material-list/electro-technical/AddNewInstrument"
            )
          ).default,
        }),
      },
      {
        path: "edit/:id",
        lazy: async () => ({
          Component: (
            await import(
              "app/pages/dashboards/material-list/electro-technical/Edit"
            )
          ).default,
        }),
      },
      {
        path: "view-equipment-history/:id",
        lazy: async () => ({
          Component: (
            await import(
              "app/pages/dashboards/material-list/electro-technical/ViewEquipmentHistory"
            )
          ).default,
        }),
      },
      {
        path: "maintenance-equipment-history",
        children: [
          {
            path: "",
            lazy: async () => ({
              Component: (
                await import(
                  "app/pages/dashboards/material-list/electro-technical/MaintenanceEquipmentHistory"
                )
              ).default,
            }),
          },
          {
            path: "view-review-form",
            lazy: async () => ({
              Component: (
                await import(
                  "app/pages/dashboards/material-list/electro-technical/MaintenanceEquipmentHistory/ViewReviewForm"
                )
              ).default,
            }),
          },
          {
            path: "edit-validity",
            lazy: async () => ({
              Component: (
                await import(
                  "app/pages/dashboards/material-list/electro-technical/MaintenanceEquipmentHistory/EditValidity"
                )
              ).default,
            }),
          },
          {
            path: "add-imc",
            lazy: async () => ({
              Component: (
                await import(
                  "app/pages/dashboards/material-list/electro-technical/MaintenanceEquipmentHistory/AddImc"
                )
              ).default,
            }),
          },

          {
            path: "view-imc",
            lazy: async () => ({
              Component: (
                await import(
                  "app/pages/dashboards/material-list/electro-technical/MaintenanceEquipmentHistory/ViewIntermediateCheck"
                )
              ).default,
            }),
          },
          {
            path: "view-planner",
            lazy: async () => ({
              Component: (
                await import(
                  "app/pages/dashboards/material-list/electro-technical/MaintenanceEquipmentHistory/ViewPlanner"
                )
              ).default,
            }),
          },
          {
            path: "add-new-equipment-history",
            lazy: async () => ({
              Component: (
                await import(
                  "app/pages/dashboards/material-list/electro-technical/MaintenanceEquipmentHistory/AddNewEquipmentHistory"
                )
              ).default,
            }),
          },
          {
            path: "clone-certificate-details",
            lazy: async () => ({
              Component: (
                await import(
                  "app/pages/dashboards/material-list/electro-technical/MaintenanceEquipmentHistory/CloneCertificateDetails"
                )
              ).default,
            }),
          },
          {
            path: "validity-detail",
            children: [
              {
                path: "",
                lazy: async () => ({
                  Component: (
                    await import(
                      "app/pages/dashboards/material-list/electro-technical/MaintenanceEquipmentHistory/ValidityDetail/index"
                    )
                  ).default,
                }),
              },
              {
                path: "add-new-master-matrix",
                lazy: async () => ({
                  Component: (
                    await import(
                      "app/pages/dashboards/material-list/electro-technical/MaintenanceEquipmentHistory/ValidityDetail/AddNewMasterMatrix"
                    )
                  ).default,
                }),
              },
              {
                path: "add-new-uncertainty-matrix",
                lazy: async () => ({
                  Component: (
                    await import(
                      "app/pages/dashboards/material-list/electro-technical/MaintenanceEquipmentHistory/ValidityDetail/UncertaintyMatrixForm"
                    )
                  ).default,
                }),
              },
              {
                path: "edit-new-master-matrix",
                lazy: async () => ({
                  Component: (
                    await import(
                      "app/pages/dashboards/material-list/electro-technical/MaintenanceEquipmentHistory/ValidityDetail/EditNewMasterMatrix"
                    )
                  ).default,
                }),
              },
              {
                path: "edit-new-uncertinity-master-matrix",
                lazy: async () => ({
                  Component: (
                    await import(
                      "app/pages/dashboards/material-list/electro-technical/MaintenanceEquipmentHistory/ValidityDetail/EditNewUncertinityMatrix"
                    )
                  ).default,
                }),
              },
              {
                path: "add-new-uncertinity-matrix",
                lazy: async () => ({
                  Component: (
                    await import(
                      "app/pages/dashboards/material-list/electro-technical/MaintenanceEquipmentHistory/ValidityDetail/AddNewUncertinityMatrix"
                    )
                  ).default,
                }),
              },
              {
                path: "edit-new-uncertinity-matrix",
                lazy: async () => ({
                  Component: (
                    await import(
                      "app/pages/dashboards/material-list/electro-technical/MaintenanceEquipmentHistory/ValidityDetail/EditNewUncertinityMatrix"
                    )
                  ).default,
                }),
              },
            ],
          },
        ],
      },
      {
        path: "dump/:id",
        lazy: async () => ({
          Component: (
            await import(
              "app/pages/dashboards/material-list/electro-technical/dump"
            )
          ).default,
        }),
      },
      {
        path: "log-book/:id",
        lazy: async () => ({
          Component: (
            await import(
              "app/pages/dashboards/material-list/electro-technical/Logbook"
            )
          ).default,
        }),
      },
      {
        path: "view-verification-list/:id",
        lazy: async () => ({
          Component: (
            await import(
              "app/pages/dashboards/material-list/electro-technical/ViewVerificationList"
            )
          ).default,
        }),
      },
      {
        path: "verification-list",
        lazy: async () => ({
          Component: (
            await import(
              "app/pages/dashboards/material-list/electro-technical/VarificationList"
            )
          ).default,
        }),
      },
      {
        path: "view-checklist/:id",
        lazy: async () => ({
          Component: (
            await import(
              "app/pages/dashboards/material-list/electro-technical/ViewChecklist"
            )
          ).default,
        }),
      },
      {
        path: "add-new-master-matrix",
        lazy: async () => ({
          Component: (
            await import(
              "app/pages/dashboards/material-list/electro-technical/AddNewMasterMatrix"
            )
          ).default,
        }),
      },
      {
        path: "add-new-general-checklist-matrix",
        lazy: async () => ({
          Component: (
            await import(
              "app/pages/dashboards/material-list/electro-technical/AddNewGeneralChecklistMatrix"
            )
          ).default,
        }),
      },
    ],
  }));
};