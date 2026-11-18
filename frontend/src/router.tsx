import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import OrderPage from "./OrderPage";
import FragrancesPage from "./FragrancesPage";

const rootRoute = createRootRoute({ component: Outlet });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: ({ location }) => {
    throw redirect({ to: "/order", search: location.search, replace: true });
  },
});

const orderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order",
  component: OrderPage,
});

const fragrancesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/fragrances",
  component: FragrancesPage,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, orderRoute, fragrancesRoute]),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
