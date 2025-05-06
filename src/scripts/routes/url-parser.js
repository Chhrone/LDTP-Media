// Ekstrak segmen dari pathname URL
function extractPathnameSegments(path) {
  const splitUrl = path.split('/');

  return {
    resource: splitUrl[1] || null,
    id: splitUrl[2] || null,
    page: splitUrl[1] === 'page' ? splitUrl[2] : null,
  };
}

// Membuat route dari segmen pathname
function constructRouteFromSegments(pathSegments) {
  let pathname = '';

  // Penanganan khusus untuk route pagination
  if (pathSegments.resource === 'page' && pathSegments.page) {
    return '/page/:page';
  }

  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }

  if (pathSegments.id) {
    pathname = pathname.concat('/:id');
  }

  return pathname || '/';
}

// Mendapatkan pathname aktif dari URL hash
export function getActivePathname() {
  return location.hash.replace('#', '') || '/';
}

// Mendapatkan route aktif berdasarkan pathname
export function getActiveRoute() {
  const pathname = getActivePathname();
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

// Parse pathname aktif menjadi segmen
export function parseActivePathname() {
  const pathname = getActivePathname();
  return extractPathnameSegments(pathname);
}

// Mendapatkan route dari pathname tertentu
export function getRoute(pathname) {
  const urlSegments = extractPathnameSegments(pathname);
  return constructRouteFromSegments(urlSegments);
}

// Parse pathname tertentu menjadi segmen
export function parsePathname(pathname) {
  return extractPathnameSegments(pathname);
}
