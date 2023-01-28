import Audit from "./Audit"
import Organization from "./Organization"

interface WorkOrder {
  Id: string;
  name: string;
  image: string;
  description: string;
  status: string;
  type: string;
  audit: Audit;
}

export default WorkOrder;