export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('Location permission denied'));
            break;
          case error.POSITION_UNAVAILABLE:
            reject(new Error('Location information unavailable'));
            break;
          case error.TIMEOUT:
            reject(new Error('Location request timed out'));
            break;
          default:
            reject(new Error('Unknown location error'));
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

export function watchPosition(
  onSuccess: (position: GeolocationPosition) => void,
  onError: (error: Error) => void
): number {
  if (!navigator.geolocation) {
    onError(new Error('Geolocation is not supported'));
    return -1;
  }

  return navigator.geolocation.watchPosition(
    onSuccess,
    (error) => onError(new Error(error.message)),
    {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 27000,
    }
  );
}

export function clearWatch(watchId: number): void {
  if (navigator.geolocation && watchId !== -1) {
    navigator.geolocation.clearWatch(watchId);
  }
}
