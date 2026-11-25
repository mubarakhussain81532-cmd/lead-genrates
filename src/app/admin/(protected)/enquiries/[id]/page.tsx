import EnquiryDetail from "@/components/admin/enquiry-detail";

export default async function EnquiryDetailPage({
  params,
}: PageProps<"/admin/enquiries/[id]">) {
  const { id } = await params;
  return <EnquiryDetail id={id} />;
}
