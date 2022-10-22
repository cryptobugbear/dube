import Audit from "./Audit"
import Organization from "./Organization"

interface Inventory {
  Id: string;
  orgId: string;
  name: string;
  image: boolean;
  location: string;
  type: string;
  audit: Audit;
  organization: Organization;
}

export default Inventory;