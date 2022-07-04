import { plainToClass, Type } from "class-transformer";
import "reflect-metadata";

export class Album {
  id: number;

  name: string;

  @Type(() => Photo)
  photos: Photo[];
}

export class Photo {
  id: number;
  filename: string;
}

describe("class-transformer", () => {
  it("happy path", () => {
    let album = plainToClass(Album, {
      id: 1,
      name: "a",
      photos: [
        {
          id: 11,
          filename: "222",
        },
        {
          id: 11,
          filename: "223",
        },
      ],
    });

    console.log(album);

    expect(1).toBe(1);
  });
});
