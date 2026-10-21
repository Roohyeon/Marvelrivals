import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8">
      <Image
        src="/images/heroes/iron-man.png"
        alt="아이언맨 전신 이미지"
        width={680}
        height={961}
        sizes="200px"
        className="h-auto w-48"
        fetchPriority="high"
      />
      <h1 className="text-2xl font-bold">Rivals Dex</h1>
      <p className="text-sm">1단계: 프로젝트 세팅 완료</p>
    </main>
  );
}
