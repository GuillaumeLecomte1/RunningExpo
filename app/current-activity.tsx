import { useEffect, useState, useRef } from 'react';



import { StyleSheet, View, Pressable, Platform } from 'react-native';



import { router } from 'expo-router';



import * as Location from 'expo-location';



import { LinearGradient } from 'expo-linear-gradient';



import { ThemedText } from '@/components/ThemedText';



import { WebMapComponent } from '@/app/WebMapComponent';



import { PROVIDER_GOOGLE } from 'react-native-maps';



import { useActivities } from '@/hooks/useActivities';







interface LocationPoint {



  latitude: number;



  longitude: number;



  timestamp: number;



  accuracy?: number;



  altitude?: number;



  speed?: number;



}







// Importation conditionnelle de react-native-maps



const MapView = Platform.select({



  native: () => require('react-native-maps').default,



  default: () => null,



})();







const Polyline = Platform.select({



  native: () => require('react-native-maps').Polyline,



  default: () => null,



})();







// Composant carte conditionnel



const MapComponent = ({ mapRef, locations }: { mapRef: React.RefObject<any>, locations: LocationPoint[] }) => {



  if (Platform.OS === 'web') {



    return <WebMapComponent />;



  }







  if (!MapView || !Polyline) return null;







  return (



    <MapView



      ref={mapRef}



      style={styles.map}



      provider={PROVIDER_GOOGLE}



      showsUserLocation



      followsUserLocation



    >



      <Polyline



        coordinates={locations}



        strokeColor="#6B5ECD"



        strokeWidth={3}



      />



    </MapView>



  );



};







// Ajoutez ces constantes pour la simulation



const SIMULATION_POINTS = [



  { latitude: 48.8566, longitude: 2.3522, timestamp: Date.now() }, // Paris



  { latitude: 48.8576, longitude: 2.3532, timestamp: Date.now() + 1000 },



  { latitude: 48.8586, longitude: 2.3542, timestamp: Date.now() + 2000 },



  { latitude: 48.8596, longitude: 2.3552, timestamp: Date.now() + 3000 },



  { latitude: 48.8606, longitude: 2.3562, timestamp: Date.now() + 4000 },



];







export default function CurrentActivityScreen() {



  const [locations, setLocations] = useState<LocationPoint[]>([]);



  const [elapsedTime, setElapsedTime] = useState(0);



  const [distance, setDistance] = useState(0);



  const [speed, setSpeed] = useState(0);



  const [calories, setCalories] = useState(0);



  const [isTracking, setIsTracking] = useState(true);



  const mapRef = useRef<any>(null);



  const locationSubscription = useRef<Location.LocationSubscription | null>(null);



  const startTime = useRef<number>(Date.now());



  const [isSimulating, setIsSimulating] = useState(false);



  const simulationInterval = useRef<NodeJS.Timeout | null>(null);



  const currentPointIndex = useRef(0);



  const addActivity = useActivities((state) => state.addActivity);







  useEffect(() => {



    (async () => {



      const { status } = await Location.requestForegroundPermissionsAsync();



      if (status !== 'granted') {



        alert('Permission de localisation refusée');



        return;



      }







      startTracking();



    })();







    return () => {



      if (locationSubscription.current) {



        locationSubscription.current.remove();



      }



    };



  }, []);







  const startTracking = async () => {



    locationSubscription.current = await Location.watchPositionAsync(



      {



        accuracy: Location.Accuracy.BestForNavigation,



        distanceInterval: 5,



        timeInterval: 500,



      },



      (location) => {



        const newLocation = {



          latitude: location.coords.latitude,



          longitude: location.coords.longitude,



          timestamp: location.timestamp,



          accuracy: location.coords.accuracy,



          altitude: location.coords.altitude,



          speed: location.coords.speed,
        };
        setLocations((prev) => [...prev, newLocation]);
        updateStats(newLocation);
        updateMapRegion(newLocation);



      }



    );



  };







  const updateStats = (newLocation: LocationPoint) => {



    // Mise à jour du temps écoulé



    setElapsedTime(Math.floor((Date.now() - startTime.current) / 1000));







    // Calcul de la distance



    if (locations.length > 0) {



      const lastLocation = locations[locations.length - 1];



      const newDistance = calculateDistance(



        lastLocation.latitude,



        lastLocation.longitude,



        newLocation.latitude,



        newLocation.longitude



      );



      setDistance((prev) => prev + newDistance);



      



      // Calcul de la vitesse (km/h)



      setSpeed(newDistance / ((newLocation.timestamp - lastLocation.timestamp) / 3600000));



      



      // Estimation simple des calories (à améliorer selon vos besoins)



      setCalories(Math.floor(distance * 60)); // Approximation simple



    }



  };







  const updateMapRegion = (location: LocationPoint) => {



    mapRef.current?.animateToRegion({



      latitude: location.latitude,



      longitude: location.longitude,



      latitudeDelta: 0.005,



      longitudeDelta: 0.005,



    });



  };







  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {



    const R = 6371; // Rayon de la Terre en km



    const dLat = deg2rad(lat2 - lat1);



    const dLon = deg2rad(lon2 - lon1);



    const a =



      Math.sin(dLat / 2) * Math.sin(dLat / 2) +



      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);



    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));



    return R * c;



  };







  const deg2rad = (deg: number) => deg * (Math.PI / 180);







  const formatTime = (seconds: number) => {



    const hrs = Math.floor(seconds / 3600);



    const mins = Math.floor((seconds % 3600) / 60);



    const secs = seconds % 60;



    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs



      .toString()



      .padStart(2, '0')}`;



  };







  // Fonction pour démarrer/arrêter la simulation



  const toggleSimulation = () => {



    if (isSimulating) {



      if (simulationInterval.current) {



        clearInterval(simulationInterval.current);



        simulationInterval.current = null;



      }



      setIsSimulating(false);



      currentPointIndex.current = 0;



    } else {



      startSimulation();



      setIsSimulating(true);



    }



  };







  const startSimulation = () => {



    // Réinitialiser les données



    setLocations([SIMULATION_POINTS[0]]);



    currentPointIndex.current = 1;



    startTime.current = Date.now();







    simulationInterval.current = setInterval(() => {



      if (currentPointIndex.current >= SIMULATION_POINTS.length) {



        if (simulationInterval.current) {



          clearInterval(simulationInterval.current);



          simulationInterval.current = null;



        }



        setIsSimulating(false);



        return;



      }







      const newLocation = SIMULATION_POINTS[currentPointIndex.current];



      setLocations(prev => [...prev, newLocation]);



      updateStats(newLocation);



      updateMapRegion(newLocation);



      currentPointIndex.current++;



    }, 2000); // Mise à jour toutes les 2 secondes



  };







  // Nettoyage lors du démontage du composant



  useEffect(() => {



    return () => {



      if (simulationInterval.current) {



        clearInterval(simulationInterval.current);



      }



    };



  }, []);







  const handleFinishActivity = () => {



    // Filtrer les points pour ne garder que ceux avec une bonne précision



    const filteredLocations = locations.filter(loc => loc.accuracy && loc.accuracy <= 20);



    



    const newActivity = {



      id: Date.now().toString(),



      date: new Date().toLocaleDateString('en-US', {



        month: 'long',



        day: 'numeric',



      }),



      distance: distance.toFixed(2),



      duration: formatTime(elapsedTime),



      calories,



      speed: speed.toFixed(1),



      route: filteredLocations,



      stats: {



        maxSpeed: Math.max(...filteredLocations.map(loc => loc.speed || 0)),



        avgSpeed: speed,



        totalTime: elapsedTime,



        elevationGain: calculateElevationGain(filteredLocations),



      }



    };







    // Ajouter l'activité au store



    addActivity(newActivity);







    // Retourner à l'écran principal



    router.replace('/(tabs)');



  };







  // Fonction pour calculer le dénivelé



  const calculateElevationGain = (locations: LocationPoint[]) => {



    let gain = 0;



    for (let i = 1; i < locations.length; i++) {



      const elevationDiff = (locations[i].altitude || 0) - (locations[i-1].altitude || 0);



      if (elevationDiff > 0) {



        gain += elevationDiff;



      }



    }



    return Math.round(gain);



  };







  return (



    <View style={styles.container}>



      <MapComponent mapRef={mapRef} locations={locations} />







      <View style={styles.statsContainer}>



        <LinearGradient colors={['#6B5ECD', '#8B7FE8']} style={styles.statsCard}>



          <View style={styles.timeContainer}>



            <ThemedText style={styles.timeText}>{formatTime(elapsedTime)}</ThemedText>



            <View style={styles.buttonContainer}>



              <Pressable



                style={styles.pauseButton}



                onPress={() => setIsTracking(!isTracking)}



              >



                <ThemedText style={styles.pauseButtonText}>



                  {isTracking ? '⏸️' : '▶️'}



                </ThemedText>



              </Pressable>



              <Pressable



                style={[styles.simulateButton, isSimulating && styles.simulateButtonActive]}



                onPress={toggleSimulation}



              >



                <ThemedText style={styles.simulateButtonText}>



                  {isSimulating ? '🛑' : '🎮'}



                </ThemedText>



              </Pressable>



            </View>



          </View>







          <View style={styles.statsRow}>



            <View style={styles.statItem}>



              <ThemedText style={styles.statValue}>{distance.toFixed(1)}</ThemedText>



              <ThemedText style={styles.statLabel}>km</ThemedText>



            </View>



            <View style={styles.statItem}>



              <ThemedText style={styles.statValue}>{calories}</ThemedText>



              <ThemedText style={styles.statLabel}>kcal</ThemedText>



            </View>



            <View style={styles.statItem}>



              <ThemedText style={styles.statValue}>{speed.toFixed(1)}</ThemedText>



              <ThemedText style={styles.statLabel}>km/h</ThemedText>



            </View>



          </View>



        </LinearGradient>



      </View>



      <Pressable



        style={styles.finishButton}



        onPress={handleFinishActivity}



      >



        <ThemedText style={styles.finishButtonText}>Finish</ThemedText>



      </Pressable>



    </View>



  );



}







const styles = StyleSheet.create({



  container: {



    flex: 1,



  },



  map: {



    flex: 1,



  },



  statsContainer: {



    position: 'absolute',



    bottom: 40,



    left: 20,



    right: 20,



  },



  statsCard: {



    borderRadius: 20,



    padding: 20,



  },



  timeContainer: {



    flexDirection: 'row',



    justifyContent: 'space-between',



    alignItems: 'center',



    marginBottom: 20,



  },



  timeText: {



    fontSize: 32,



    color: 'white',



    fontWeight: 'bold',



  },



  pauseButton: {



    width: 50,



    height: 50,



    borderRadius: 25,



    backgroundColor: 'rgba(255, 255, 255, 0.2)',



    justifyContent: 'center',



    alignItems: 'center',



  },



  pauseButtonText: {



    fontSize: 24,



  },



  statsRow: {



    flexDirection: 'row',



    justifyContent: 'space-between',



  },



  statItem: {



    alignItems: 'center',



  },



  statValue: {



    fontSize: 24,



    color: 'white',



    fontWeight: 'bold',



  },



  statLabel: {



    fontSize: 14,



    color: 'rgba(255, 255, 255, 0.8)',



  },



  buttonContainer: {



    flexDirection: 'row',



    gap: 10,



  },



  simulateButton: {



    width: 50,



    height: 50,



    borderRadius: 25,



    backgroundColor: 'rgba(255, 255, 255, 0.2)',



    justifyContent: 'center',



    alignItems: 'center',



  },



  simulateButtonActive: {



    backgroundColor: 'rgba(255, 0, 0, 0.3)',



  },



  simulateButtonText: {



    fontSize: 24,



  },



  finishButton: {



    width: '100%',



    height: 50,



    backgroundColor: '#6B5ECD',



    borderRadius: 25,



    justifyContent: 'center',



    alignItems: 'center',



    position: 'absolute',



    bottom: 0,



    left: 0,



    right: 0,



  },



  finishButtonText: {



    fontSize: 24,



    color: 'white',



    fontWeight: 'bold',



  },



});


