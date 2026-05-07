import { readFileSync } from 'fs';

export interface StopInfo {
    stop_name: string;
    platform_code: string | undefined;
    stop_lat: number | undefined;
    stop_lon: number | undefined;
    location_type: number; // 0=platform, 1=parent station, 2=entrance
    parent_station: string | undefined;
}

export default function loadStopsMap(stopsFilePath: string): Record<string, StopInfo> {
    const stops: Record<string, StopInfo> = {};
    const fileContent = readFileSync(stopsFilePath, 'utf-8');
    const lines = fileContent.split('\n');

    if (!lines[0]) return stops;

    const header = lines[0].split(',').map(h => h.trim());

    const idx = (col: string) => header.indexOf(col);
    const stopIdIndex       = idx('stop_id');
    const stopNameIndex     = idx('stop_name');
    const platformCodeIndex = idx('platform_code');
    const stopLatIndex      = idx('stop_lat');
    const stopLonIndex      = idx('stop_lon');
    const locationTypeIndex = idx('location_type');
    const parentStationIndex = idx('parent_station');

    if (stopIdIndex === -1 || stopNameIndex === -1) {
        throw new Error('Could not find required columns in stops file');
    }

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line) continue;

        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const stopId = values[stopIdIndex];
        const stopName = values[stopNameIndex];
        if (!stopId || !stopName) continue;

        stops[stopId] = {
            stop_name: stopName,
            platform_code: platformCodeIndex !== -1 && values[platformCodeIndex] ? values[platformCodeIndex] : undefined,
            stop_lat: stopLatIndex !== -1 ? parseFloat(values[stopLatIndex] ?? '') || undefined : undefined,
            stop_lon: stopLonIndex !== -1 ? parseFloat(values[stopLonIndex] ?? '') || undefined : undefined,
            location_type: locationTypeIndex !== -1 ? parseInt(values[locationTypeIndex] ?? '0') || 0 : 0,
            parent_station: parentStationIndex !== -1 && values[parentStationIndex] ? values[parentStationIndex] : undefined,
        };
    }

    return stops;
}
// // Usage example:
// const stops = loadStopsMap('./railNetworks/MEL/stops.txt');
// console.log(stops);

// // Get the stop_name and platform_id for a specific stop_id
// const stopIdToLookup = 11210;
// const stopInfo = stops[stopIdToLookup];
// if (stopInfo) {
//     console.log(`Stop ID: ${stopIdToLookup}, Name: ${stopInfo.stop_name}, Platform: ${stopInfo.platform_code}`);
// }