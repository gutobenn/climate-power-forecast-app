import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const LabelsPaneSetup = () => {
  const map = useMap();
  useEffect(() => {
    if (!map.getPane('labels')) {
      map.createPane('labels');
      map.getPane('labels').style.zIndex = 650;
      map.getPane('labels').style.pointerEvents = 'none';
    }
  }, [map]);
  return null;
};

export default LabelsPaneSetup; 