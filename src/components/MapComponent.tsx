import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icon using CDN
let DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const pickupIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #2563EB; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const destinationIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: #06B6D4; width: 20px; height: 20px; border-radius: 6px; border: 4px solid white; box-shadow: 0 4px 15px rgba(6, 182, 212, 0.4);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

const carIcon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="font-size: 32px; filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2)); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);">🚗</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16]
});

interface MapProps {
    pickup?: [number, number];
    destination?: [number, number];
    drivers?: any[];
    assignedDriverLocation?: [number, number];
}

const RoutingMachine = ({ pickup, destination }: { pickup: [number, number], destination: [number, number] }) => {
    const map = useMap();

    useEffect(() => {
        if (!map || !pickup || !destination) return;

        // @ts-ignore
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(pickup[0], pickup[1]),
                L.latLng(destination[0], destination[1])
            ],
            lineOptions: {
                styles: [{ color: '#2563EB', weight: 5, opacity: 0.8, lineCap: 'round' }],
                extendToWaypoints: true,
                missingRouteTolerance: 10
            },
            show: false, // Hide the instruction panel
            addWaypoints: false,
            routeWhileDragging: false,
            fitSelectedRoutes: true,
            // @ts-ignore
            createMarker: () => null // We'll use our own markers
        }).addTo(map);

        return () => {
            if (map && routingControl) {
                map.removeControl(routingControl);
            }
        };
    }, [map, pickup, destination]);

    return null;
};

const RecenterMap = ({ coords }: { coords: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        if (coords) {
            map.setView(coords, 14);
        }
    }, [coords, map]);
    return null;
};

const MapComponent: React.FC<MapProps> = ({ pickup, destination, drivers = [], assignedDriverLocation }) => {
    const [ center, setCenter ] = useState<[number, number]>([ 12.9716, 77.5946 ]); // Default to Bangalore

    useEffect(() => {
        if (pickup) {
            setCenter(pickup);
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setCenter([ pos.coords.latitude, pos.coords.longitude ]);
            }, (err) => {
                console.warn("Geolocation failed", err);
            });
        }
    }, [ pickup ]);

    return (
        <div className="h-full w-full relative">
            <MapContainer
                center={center}
                zoom={13}
                style={{ height: '100%', width: '100%', background: '#0F172A' }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                
                {pickup && (
                    <>
                        <Marker position={pickup} icon={pickupIcon}>
                            <Popup>Pickup Point</Popup>
                        </Marker>
                        <RecenterMap coords={pickup} />
                    </>
                )}

                {destination && (
                    <Marker position={destination} icon={destinationIcon}>
                        <Popup>Destination Point</Popup>
                    </Marker>
                )}

                {pickup && destination && (
                    <RoutingMachine pickup={pickup} destination={destination} />
                )}

                {assignedDriverLocation && (
                    <Marker position={assignedDriverLocation} icon={carIcon}>
                        <Popup>Your Ride</Popup>
                    </Marker>
                )}

                {drivers.map((driver: any, index: number) => (
                    <Marker key={index} position={[ driver.ltd, driver.lng ]} icon={carIcon}>
                        <Popup>{driver.fullname?.firstname}'s Vehicle</Popup>
                    </Marker>
                ))}
            </MapContainer>
            <div className="map-gradient-overlay"></div>
        </div>
    );
};

export default MapComponent;
