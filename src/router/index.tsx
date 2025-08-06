import { BrowserRouter } from 'react-router-dom';

import PermissionRouteGenerator from './PermissionRouteGenerator';

/**
 * Application Router - Uses the config-driven permission routing system
 *
 * All routes are now managed through the permissionConfig.ts file
 * Supports role- and permission-based route access control
 */
const AppRouter = () => (
  <BrowserRouter>
    <PermissionRouteGenerator />
  </BrowserRouter>
);

export default AppRouter;
