import Member from "./Member"
interface Audit {
  createdBy: Member;
  createdAt: string;
}

export default Audit;