import Audit from "./Audit"
import Organization from "./Organization"
import WorkOrder from "./WorkOrder";
interface Inventory {
  id: string;
  name: string;
  imageS3: string;
  location: string;
  type: string;
  audit: Audit;
  organization: Organization;
  workOrders: Array<WorkOrder>; 
}

export default Inventory;