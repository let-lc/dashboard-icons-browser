import { Inter } from 'next/font/google';
import Head from 'next/head';
import { useMemo, useState } from 'react';
import { useDebounce } from 'react-use';
import { IconHelpTriangle, IconPhotoSearch } from '@tabler/icons-react';

import { useImageData } from '../hooks/useImageData';

const inter = Inter({ subsets: ['latin'] });

const HomePage = () => {
  const [inputValue, setInputValue] = useState('');
  const [searchString, setSearchString] = useState('');
  const { data, error, isLoading, isError, isSuccess } = useImageData({ enabled: true, refetchOnWindowFocus: false });

  useDebounce(
    () => {
      setSearchString(inputValue.toLowerCase());
    },
    750,
    [inputValue]
  );

  const dataFilter = () => {
    if (!isSuccess) {
      return [];
    }

    if (searchString.length === 0) {
      return Object.keys(data);
    }

    const filteredData: Array<string> = [];

    outer: for (const imgKey in data) {
      let imgKeyIdx = 0;
      for (let i = 0; i < searchString.length; i++) {
        while (imgKey[imgKeyIdx] !== searchString[i]) {
          imgKeyIdx++;
          if (imgKeyIdx >= imgKey.length) {
            continue outer;
          }
        }
        imgKeyIdx++;
      }
      filteredData.push(imgKey);
    }

    return filteredData;
  };

  const copyHandler = (name: string, ext: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    navigator.clipboard
      .writeText(`${name}.${ext}`)
      .then(() => {
        (e.target as HTMLButtonElement).innerText = 'Copied!';
        setTimeout(() => {
          (e.target as HTMLButtonElement).innerText = ext.toUpperCase();
        }, 1000);
      })
      .catch((err) => {
        alert('Failed to copy.');
        console.error(err);
      });
  };

  return (
    <>
      <Head>
        <title>Dashboard Icon Browser</title>
      </Head>
      <main
        className={`mx-4 flex min-h-screen max-w-screen-xl flex-col items-center gap-2 py-12 xl:mx-auto ${inter.className}`}
      >
        <div className="self-start">
          <div>
            <h3 className="inline-block text-base font-semibold text-gray-900">Dashboard Icon Browser</h3>
            <a
              href="https://github.com/let-lc/dashboard-icons-browser"
              rel="noreferrer noopener"
              className="ml-2 inline-block rounded bg-gray-200 px-1 font-mono text-sm hover:underline"
            >
              [GitHub]
            </a>
          </div>
          <p className="max-w-2xl text-sm text-gray-500">
            Simple site for searching icon filename from the{' '}
            <a
              href="https://github.com/walkxcode/dashboard-icons"
              rel="noreferrer noopener"
              className="font-mono text-black underline hover:text-blue-500"
            >
              dashboard-icons
            </a>{' '}
            project by <em>Bjorn Lammers</em>.
          </p>
        </div>

        <div className="mt-2 flex w-full gap-2">
          <div className="relative w-full rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <IconPhotoSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              autoFocus
              type="text"
              className="block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Search dashboard icons..."
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.currentTarget.value);
              }}
            />
          </div>
          <div className="flex items-center whitespace-nowrap rounded border bg-gray-50 p-2 text-xs gap-1">
            <IconHelpTriangle className='w-4 h-4 text-blue-500' />
            <div>
              Click <span className="mx-1 rounded border bg-white px-1">button</span> above the image to copy the file
              name.
            </div>
          </div>
        </div>
        <div>
          {isLoading ? (
            <div className="animate-pulse select-none rounded-md bg-gray-200 px-12 py-2">
              <p className="text-sm font-medium text-gray-800">Loading...</p>
            </div>
          ) : isError ? (
            <div className="animate-pulse select-none rounded-md bg-red-200 px-12 py-2">
              <p className="text-sm font-medium text-red-800">{error.message}</p>
            </div>
          ) : (
            isSuccess && (
              <div className="flex flex-wrap justify-center gap-2">
                {dataFilter().map((imgKey) => (
                  <div key={imgKey} className="w-30 rounded border bg-white p-2 hover:bg-gray-50/50">
                    <div className="mb-2 grid grid-cols-1 gap-1 text-xs">
                      <button
                        disabled={!data[imgKey]?.png}
                        onClick={copyHandler(imgKey, 'png')}
                        className="rounded border bg-white transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:opacity-50"
                      >
                        PNG
                      </button>
                      <button
                        disabled={!data[imgKey]?.svg}
                        onClick={copyHandler(imgKey, 'svg')}
                        className="rounded border bg-white transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:opacity-50"
                      >
                        SVG
                      </button>
                    </div>
                    <div className="mx-auto w-fit rounded bg-gray-200/75 p-2 transition-colors hover:bg-gray-300">
                      <img
                        src={data[imgKey]?.png || data[imgKey]?.svg}
                        alt={imgKey}
                        className="h-16 w-16 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <p className="w-20 break-words text-center text-xs">{imgKey}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </main>
    </>
  );
};

export default HomePage;
