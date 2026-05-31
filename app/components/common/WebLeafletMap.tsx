import { View } from "react-native";

type Coordinate = {
  latitude: number;
  longitude: number;
};

type Region = {
  latitude: number;
  longitude: number;
};

type Props = {
  region: Region;
  selectedLocation: Coordinate | null;
  onSelectLocation: (location: Coordinate) => void;
  onRegionChange: (region: Region) => void;
};

export default function WebLeafletMap(_: Props) {
  return <View style={{ flex: 1 }} />;
}
