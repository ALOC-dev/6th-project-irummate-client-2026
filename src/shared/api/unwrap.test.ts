import { describe, expect, it } from 'vitest';

import { unwrap, unwrapList } from './unwrap';

describe('unwrap', () => {
  it('봉투에서 data를 꺼낸다', () => {
    expect(unwrap({ status: 200, data: { id: 1 } })).toEqual({ id: 1 });
  });

  it.each([
    ['배열', [1, 2], [1, 2]],
    ['null', null, []],
    ['undefined', undefined, []],
  ] as const)('목록: data가 %s', (_name, data, expected) => {
    expect(unwrapList({ data: data as number[] | null | undefined })).toEqual(expected);
  });
});
