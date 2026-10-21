import { Container } from "./Container";

/** 아직 만들지 않은 화면 — 해당 단계에서 실제 화면으로 바뀝니다 */
export function PagePlaceholder({ title, stage }: { title: string; stage: string }) {
  return (
    <Container className="py-10">
      <h1 className="text-title font-bold xl:text-h1">{title}</h1>
      <p className="mt-2 text-body text-secondary">{stage}에서 만들 화면입니다.</p>
    </Container>
  );
}
