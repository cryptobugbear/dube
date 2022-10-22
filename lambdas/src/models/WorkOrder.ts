import Audit from "./Audit"
import Organization from "./Organization"

interface WorkOrder {
  Id: string;
  orgId: string;
  name: string;
  image: boolean;
  description: string;
  status: string;
  type: string;
  audit: Audit;
  organization: Organization;
}

export default WorkOrder;