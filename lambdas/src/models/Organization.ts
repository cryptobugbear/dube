import Member from "./Member"

interface Organization {
  Id: string;
  orgId: string;
  name: string;
  members: Array<Member>;
}

export default Organization;