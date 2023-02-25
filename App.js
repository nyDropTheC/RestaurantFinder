import React from 'react';

import { StatusBar } from 'expo-status-bar';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

import MapView, { Marker } from 'react-native-maps';
import { API_KEY_MAP, API_KEY_GOOGLE } from '@env';

export default function App() {
	const [ address, setAddress ] = React.useState ( '' );

	const [ data, setData ] = React.useState ( {
		coordinates: { latitude: 0, longitude: 0 },
		restaurantData: [ ]
	} );

	const onClick = ( ) => {
		fetch ( `https://www.mapquestapi.com/geocoding/v1/address?key=${API_KEY_MAP}&location=${address}` )
			.then ( resp => resp.json ( ) )
			.then ( resp => {
				const data = { 
					coordinates: { 
						latitude: resp.results [ 0 ].locations [ 0 ].displayLatLng.lat, 
						longitude: resp.results [ 0 ].locations [ 0 ].displayLatLng.lng
					}, 
					
					restaurantData: [ ] 
				};
				
				fetch ( `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${data.coordinates.latitude}%2C${data.coordinates.longitude}&type=restaurant&radius=750&key=${API_KEY_GOOGLE}` )
					.then ( resp => resp.json ( ) )
					.then ( resp => {
						for ( var restaurant of resp.results ) {
							data.restaurantData.push ( {
								name: restaurant.name,
								address: restaurant.vicinity,
								location: { latitude: restaurant.geometry.location.lat, longitude: restaurant.geometry.location.lng }
							} );
						}

						setData ( data );
					} )
					.catch ( err => Alert.alert ( 'Error', err ) );
			} )
			.catch ( err => Alert.alert ( 'Error', err ) );
	};

	const inputElement = ( ( ) => {
		return <View>
			<TextInput style={ { width: 300, borderColor: 'black', borderWidth: 2 } } onChangeText={ ( text ) => setAddress ( text ) } value={ address }/>
			<Button style={ { width: 300 } } onPress={ onClick } title='Find'/>
		</View>
	} ) ( );

	const mapElement = ( ( ) => {
		if ( data.coordinates.latitude === 0 && data.coordinates.longitude === 0 ) {
			return <View/>
		}

		return <MapView
				style={
					{ flex: 1, width: '100%', height: '100%' }
				}

				initialRegion={ 
					{
						latitude: 60.200692,
						longitude: 24.934302,
						latitudeDelta: 0.0322,
						longitudeDelta: 0.0221
					}
				}

				region={
					{ 
						...data.coordinates,
						latitudeDelta: 0.75 / 110.574, // Magic number from StackOverflow
						longitudeDelta: 0.00000000000000000001 // Arbitrary small number
					}
				}
			>
			{ data.restaurantData.map ( data => <Marker 
				key={ data.name }
				title={ data.name }
				description={ data.address }
				coordinate={ data.location }
			/> ) }
		</MapView>
	} ) ( );

	return (
		<View style={styles.container}>
			{ mapElement }
			{ inputElement }
			<StatusBar style="auto" />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
