import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";
import App from "./App";
import FragrancesPage from "./FragrancesPage";

const rootRoute = createRootRoute({ component: Outlet });

const orderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: App,
});

const fragrancesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fragrances",
  component: FragrancesPage,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([orderRoute, fragrancesRoute]),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
