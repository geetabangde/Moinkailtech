
import  { useState } from 'react';
import { Button, Card, Input } from '../../../../../../../components/ui'
import { useNavigate } from 'react-router';

const MasterMatrixForm = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    unityType: 'Pressure',
    mode: '',
    unit: 'Hectopascal(hPa)',
    instrumentRangeMin: '',
    instrumentRangeMax: '',
    calibratedRangeMin: '',
    calibratedRangeMax: '',
    leastCount: '',
    stability: '',
    remarks: '',
    uniformity: '',
    percentageOfRange: '',
    percentageOfMeasurement: '',
    absoluteValue: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Add master uncertinity Matrix Form</h1>
          <Button
           className="h-8 space-x-1.5 rounded-md px-3 text-xs "
            color="primary"
         
          onClick={() => 
            navigate('/dashboards/material-list/electro-technical/maintenance-equipment-history/validity-detail')
          }>
            ← Back to Master Detail Entry List 
          </Button>
        </div>

        {/* Main Form Card */}
        <Card className="bg-white shadow-sm rounded-lg p-6">
          <div className="space-y-4">
            {/* Unity Type */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Unity Type/ parameter 
              </label>
              <div className="col-span-9">
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.unityType}
                  onChange={(e) => handleInputChange('unityType', e.target.value)}
                >
                  <option>Pressure</option>
                </select>
              </div>
            </div>

            {/* Mode */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Mode
              </label>
              <div className="col-span-9">
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.mode}
                  onChange={(e) => handleInputChange('mode', e.target.value)}
                >
                  <option>Not Specified</option>
                </select>
              </div>
            </div>

            {/* Unit */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Unit
              </label>
              <div className="col-span-9">
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                >
                  <option>Hectopascal(hPa)</option>
                </select>
              </div>
            </div>

            {/* Instrument range min */}


            {/* point */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Point
              </label>
              <div className="col-span-9 ">
                <Input 
                  type="text"
                  className="flex-1 border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.point}
                  onChange={(e) => handleInputChange('point', e.target.value)}
                />
               
              </div>
            </div>

  {/* cmc */}
            <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                Cmc
              </label>
              <div className="col-span-9 ">
                <Input 
                  type="text"
                  className="flex-1 border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.cmc}
                  onChange={(e) => handleInputChange('cmc', e.target.value)}
                />
               
              </div>
            </div>
            {/* uncertinity Term */}
              <div className="grid grid-cols-12 gap-4 items-center">
              <label className="col-span-3 text-right text-gray-700 font-medium">
                uncertinity Term
              </label>
              <div className="col-span-9">
                <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.uncertinityTerm}
                  onChange={(e) => handleInputChange('uncertinityTerm', e.target.value)}
                >
                  <option>Hectopascal(hPa)</option>
                </select>
              </div>
            </div>
           
               {/* CMC Unit*/}
   
               <div className="grid grid-cols-12 gap-4 items-center">
                <label className="col-span-3 text-right text-gray-700 font-medium">
                  CMC Unit
                </label>
                <div className="col-span-9">
                 <select 
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                  value={formData.cmcUnit}
                  onChange={(e) => handleInputChange('cmcUnit', e.target.value)}
                >
                  <option>inc(hPa)</option>
                </select>
                  
                </div>
              </div>
          

                {/* Drift*/}
              <div className="grid grid-cols-12 gap-4 items-center">
                <label className="col-span-3 text-right text-gray-700 font-medium">
                  Drift
                </label>
                <div className="col-span-9">
                  <Input 
                    type="text"
                    className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                    value={formData.drift}
                    onChange={(e) => handleInputChange('drift', e.target.value)}
                  />
                </div>
              </div>

              {/* Desity*/}
              <div className="grid grid-cols-12 gap-4 items-center">
                <label className="col-span-3 text-right text-gray-700 font-medium">
                 Desity
                </label>
                <div className="col-span-9">
                  <Input 
                    type="text"
                    className="w-full border border-cyan-400 rounded px-3 py-2 focus:outline-none focus:border-cyan-500"
                    value={formData.desity}
                    onChange={(e) => handleInputChange('desity', e.target.value)}
                  />
                </div>
              </div>
           
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded font-medium">
              Save Master Matrix 
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MasterMatrixForm;