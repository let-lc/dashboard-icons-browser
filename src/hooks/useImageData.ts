import { UndefinedInitialDataOptions, useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

type ImageData = Record<string, { png?: string; svg?: string }>;
type ParsedImageData = { name: string; url: string };
type GitHubApiData = Array<{
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  _links: { self: string; git: string; html: string };
}>;

const PNG_URL = 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@main/png/';
const SVG_URL = 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons@main/svg/';

const parseSoup = (soup: string): Array<ParsedImageData> => {
  const list: Array<ParsedImageData> = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(soup, 'text/html');
  const links = doc.querySelectorAll<HTMLAnchorElement>('.listing td.name > a');

  for (const aTag of links) {
    const name = aTag.innerText.trim();
    const url = `https://cdn.jsdelivr.net${aTag.getAttribute('href')}`;
    if (name !== '...') {
      list.push({ name, url });
    }
  }

  return list;
};

const getImageData = async (): Promise<ImageData> => {
  const data: ImageData = {};
  await axios
    .get<string>(PNG_URL)
    .then((res) => {
      const list = parseSoup(res.data);
      const pngRgx = /\.png$/i;
      list.forEach((item) => {
        if (pngRgx.test(item?.name)) {
          const key = item.name.slice(0, -4);
          data[key] = { png: item.url };
        }
      });
    })
    .catch((err: AxiosError) => {
      console.log(err.message);
    });

  await axios
    .get<string>(SVG_URL)
    .then((res) => {
      const list = parseSoup(res.data);
      const pngRgx = /\.svg$/i;
      list.forEach((item) => {
        if (pngRgx.test(item?.name)) {
          const key = item.name.slice(0, -4);
          if (key in data) {
            data[key].svg = item.url;
          } else {
            data[key] = { svg: item.url };
          }
        }
      });
    })
    .catch((err: AxiosError) => {
      console.log(err.message);
    });

  return data;
};

type UserImageDataOptions = Omit<
  UndefinedInitialDataOptions<ImageData, Error, ImageData, string[]>,
  'queryKey' | 'queryFn'
>;

export const useImageData = (options: UserImageDataOptions = {}) => {
  return useQuery({ queryKey: ['image-data'], queryFn: getImageData, ...options });
};
