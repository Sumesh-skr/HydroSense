import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, update, get } from 'firebase/database';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const rtdb = getDatabase(app);
export const auth = getAuth(app);

// Deeply sanitize strings by removing leading/trailing quotes
function sanitizeFirebaseData(data: any): any {
  if (typeof data === 'string') {
    return data.trim().replace(/^['"]|['"]$/g, '');
  }
  if (Array.isArray(data)) {
    return data.map(sanitizeFirebaseData);
  }
  if (data !== null && typeof data === 'object') {
    const sanitized: any = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitized[key] = sanitizeFirebaseData(data[key]);
      }
    }
    return sanitized;
  }
  return data;
}

// Data fetching helper for RTDB
export function subscribeToDevice(deviceId: string, callback: (data: any) => void) {
  const deviceRef = ref(rtdb, deviceId);
  return onValue(deviceRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(sanitizeFirebaseData(snapshot.val()));
    } else {
      console.log(`Node ${deviceId} not found in RTDB`);
    }
  }, (error) => {
    console.error("Error subscribing to RTDB device:", error);
  });
}

// One-time check if device exists
export async function checkDeviceExists(deviceId: string) {
  const deviceRef = ref(rtdb, deviceId);
  try {
    const snapshot = await get(deviceRef);
    return snapshot.exists();
  } catch (error) {
    console.error("Error checking device existence:", error);
    return false;
  }
}

// Update actuator state in RTDB
export async function updateDeviceActuator(deviceId: string, actuator: string, status: string | boolean) {
  const deviceRef = ref(rtdb, deviceId);
  try {
    await update(deviceRef, {
      [actuator]: status
    });
  } catch (error) {
    console.error(`Error updating actuator ${actuator}:`, error);
    throw error;
  }
}

// RTDB usually holds current state. For history, we'd need a separate path.
// If the user hasn't specified a history path, the UI can accumulate points locally 
// or fetch from a known sub-path.
export function subscribeToHistory(deviceId: string, callback: (data: any[]) => void) {
  // If there's a history path in RTDB, we'd use it here.
  // For now, providing a stable mock or empty array if not defined.
  const historyRef = ref(rtdb, `History/${deviceId}`);
  return onValue(historyRef, (snapshot) => {
    if (snapshot.exists()) {
      const historyObj = snapshot.val();
      const historyArray = Object.values(historyObj);
      callback(sanitizeFirebaseData(historyArray));
    } else {
      callback([]);
    }
  }, (error) => {
    console.warn("History path not accessible in RTDB:", error);
  });
}
