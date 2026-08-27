import Image from "next/image";

export function HeroIllustration() {
  return (
    <figure className="hero-art">
      <Image
        src="/media/hero-still-life.jpg"
        alt="A still life of paper, notes, and a slate-colored book"
        width={960}
        height={720}
        priority
        sizes="(max-width: 1023px) 100vw, 42vw"
      />
      <figcaption>Open systems begin with a shared page.</figcaption>
      <p className="media-provenance">Reference asset · rights review pending</p>
    </figure>
  );
}
