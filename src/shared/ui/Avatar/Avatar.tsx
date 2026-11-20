const AVATAR_TONES = ['mint', 'pink', 'yellow', 'green', 'gray', 'blue', 'lavender', 'peach'] as const;

export type AvatarTone = (typeof AVATAR_TONES)[number];

export interface AvatarProps {
  name?: string;
  /** 사용자가 올린 사진. 없으면 캐릭터 이미지를 쓴다. */
  src?: string;
  /** 캐릭터 배경 색. 비우면 seed나 이름으로 고른다. */
  tone?: AvatarTone;
  /** 사람 번호(사용자 ID). 주면 번호 순서대로 색이 돌아가서 번호가 가까운 사람끼리 색이 겹치지 않는다. */
  seed?: number;
  size?: number;
  /** 옆에 이름이 글자로 보일 때 켠다. 화면 읽기 프로그램이 건너뛴다. */
  decorative?: boolean;
  className?: string;
}

function toneForName(name: string): AvatarTone {
  const sum = [...name].reduce((total, char) => total + char.charCodeAt(0), 0);
  return AVATAR_TONES[sum % AVATAR_TONES.length] ?? 'mint';
}

function toneForSeed(seed: number): AvatarTone {
  const count = AVATAR_TONES.length;
  return AVATAR_TONES[((Math.trunc(seed) % count) + count) % count] ?? 'mint';
}

export function Avatar({ name = '', src, tone, seed, size = 40, decorative = false, className }: AvatarProps) {
  const label = decorative
    ? { 'aria-hidden': true }
    : { role: 'img', 'aria-label': name || '프로필' };
  const resolvedTone = tone ?? (seed === undefined ? toneForName(name) : toneForSeed(seed));

  return (
    <span
      {...label}
      style={{ width: size, height: size }}
      className={['inline-flex shrink-0 overflow-hidden rounded-avatar', className].filter(Boolean).join(' ')}
    >
      <img
        src={src ?? `/brand/avatars/${resolvedTone}.webp`}
        alt=""
        draggable={false}
        className="size-full object-cover"
      />
    </span>
  );
}
