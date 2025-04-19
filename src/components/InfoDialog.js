import { Transition } from '@headlessui/react';

const InfoDialog = ({ isOpen, onClose, data, position, screenPosition }) => {
  if (!isOpen) return null;

  // Determine if the pin is on the left or right half of the map
  const isOnRightSide = screenPosition.x > window.innerWidth / 2;
  const offsetX = isOnRightSide ? -180 : 180; // Adjust based on dialog width
  const offsetY = -50; // Center vertically relative to pin

  return (
    <Transition
      show={isOpen}
      enter="dialog-enter"
      enterFrom="dialog-enter"
      enterTo="dialog-enter-active"
      leave="dialog-exit"
      leaveFrom="dialog-exit"
      leaveTo="dialog-exit-active"
    >
      <div 
        className="fixed z-[900] w-80 bg-white rounded-lg shadow-lg p-4"
        style={{
          left: `${screenPosition.x + offsetX}px`,
          top: `${screenPosition.y + offsetY}px`,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Location Details</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Coordinates</h4>
            <p className="text-sm">
              {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
            </p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Energy Potential</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Wind Power:</span>
                <span className="font-medium">{data.wind} MW</span>
              </div>
              <div className="flex justify-between">
                <span>Solar Power:</span>
                <span className="font-medium">{data.solar} MW</span>
              </div>
              <div className="flex justify-between">
                <span>Hydro Power:</span>
                <span className="font-medium">{data.hydro} MW</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Recommended Type</h4>
            <p className="text-sm font-medium capitalize">{data.bestType}</p>
          </div>
        </div>
      </div>
    </Transition>
  );
};

export default InfoDialog; 