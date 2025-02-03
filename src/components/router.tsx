import { Route, Switch } from "wouter-preact";
import LandingPage from "../pages/landing";
import RoomPage from "../pages/room";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/room/:roomId" component={RoomPage} />
    </Switch>
  );
}

export default Router;
