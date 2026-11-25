import { submitPublicEnquiry } from "@/lib/submit-public-enquiry";

export async function POST(request: Request) {
  return submitPublicEnquiry(request, "contact");
}
