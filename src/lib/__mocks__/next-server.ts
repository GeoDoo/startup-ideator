export class NextRequest {}
export class NextResponse {
  static json(body: unknown) { return body; }
  static next() { return {}; }
  static redirect(url: string) { return { url }; }
}
