// Plain module (no 'use client') so the restore script string can be inlined
// from the server root layout without crossing a client boundary.
// UI prefs live as attributes on <html> + localStorage, styled purely with CSS.

export const SIDEBAR_STORAGE_KEY = 'admin-sidebar-collapsed';
export const SIDEBAR_COLLAPSED_ATTR = 'data-sidebar-collapsed';

export const APPS_VIEW_STORAGE_KEY = 'applications-view';
export const APPS_VIEW_ATTR = 'data-applications-view';

// Inlined in the root layout <body> so saved prefs apply before first paint.
export const UI_RESTORE_SCRIPT = `try{
if(localStorage.getItem('${SIDEBAR_STORAGE_KEY}')==='1')document.documentElement.setAttribute('${SIDEBAR_COLLAPSED_ATTR}','');
if(localStorage.getItem('${APPS_VIEW_STORAGE_KEY}')==='cards')document.documentElement.setAttribute('${APPS_VIEW_ATTR}','cards');
}catch(e){}`.replace(/\n/g, '');
