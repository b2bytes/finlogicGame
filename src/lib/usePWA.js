import { useEffect, useState, useCallback } from 'react';

/**
 * usePWA — Maneja el ciclo PWA: registro de service worker, prompt de instalación
 * y permisos de notificaciones (Web Notifications API local + push si hay subscripción).
 *
 * Nota: las push remotas requieren VAPID keys del servidor. Aquí soportamos:
 *  · Notificaciones LOCALES (registration.showNotification) → siempre disponibles
 *  · Suscripción push remota → opt-in vía requestPushSubscription(vapidKey)
 */
export function usePWA() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [swReady, setSwReady] = useState(false);

  // Registro del Service Worker
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then(() => setSwReady(true))
      .catch(() => setSwReady(false));
  }, []);

  // Detectar standalone (instalada)
  useEffect(() => {
    const standalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(standalone);
  }, []);

  // Capturar el evento beforeinstallprompt (Chrome/Edge/Android)
  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
    };
    const onInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!installPrompt) return { outcome: 'unavailable' };
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    setIsInstallable(false);
    return choice;
  }, [installPrompt]);

  // Pedir permiso de notificaciones
  const requestNotifications = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported';
    const result = await Notification.requestPermission();
    setNotifPermission(result);
    // Notificación de bienvenida si concede
    if (result === 'granted' && 'serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification('🎉 Notificaciones activadas', {
        body: 'Te avisaremos de plazos legales y novedades de tus casos.',
        icon: 'https://qtrypzzcjebvfhfsdmaq.supabase.co/storage/v1/object/public/base44-prod/public/icon-192.png',
        tag: 'finlogic-welcome',
      });
    }
    return result;
  }, []);

  // Disparar notificación local (útil para alertas in-app, ej: plazo próximo)
  const showLocalNotification = useCallback(async (title, options = {}) => {
    if (Notification.permission !== 'granted') return false;
    if (!('serviceWorker' in navigator)) return false;
    const reg = await navigator.serviceWorker.ready;
    reg.showNotification(title, {
      icon: 'https://qtrypzzcjebvfhfsdmaq.supabase.co/storage/v1/object/public/base44-prod/public/icon-192.png',
      vibrate: [100, 50, 100],
      ...options,
    });
    return true;
  }, []);

  return {
    isInstallable,
    isInstalled,
    notifPermission,
    swReady,
    promptInstall,
    requestNotifications,
    showLocalNotification,
  };
}