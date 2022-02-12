import {from, Observable} from "rxjs";

export class TextFileReader {

  read(file: File): Observable<string> {
    return TextFileReader.supportWorkers() ? from(this.readSync(file)) : from(this.readAsync(file));
  }

  private readSync(file: File): Promise<string> {
    const worker = new Worker(new URL('src/app/app.worker', import.meta.url));
    const promise = new Promise<string>((resolve, reject) => {
      worker.onmessage = ({data}) => {
        if (!!data.error) {
          reject(data.error);
        }
        if (!!data.result) {
          resolve(data.result);
        }
      };
    });
    worker.postMessage(file);
    return promise;
  }

  private readAsync(file: File): Promise<string> {
    const reader = new FileReader();
    return new Promise<string>((resolve, reject) => {
      reader.onabort = (event$) => TextFileReader.onabort(event$, reject);
      reader.onerror = (event$) => TextFileReader.onerror(event$, reject);
      reader.onload = (event$) => TextFileReader.onload(event$, reader.result, resolve, reject);
      reader.onloadend = (event$) => TextFileReader.onloadend(event$);
      reader.onloadstart = (event$) => TextFileReader.onloadstart(event$);
      reader.onprogress = (event$) => TextFileReader.onprogress(event$);
      reader.readAsText(file);
    });
  }

  private static onabort(event$: ProgressEvent<FileReader>, reject: (reason?: any) => void) {
    console.debug("TextFileReader", "onabort", event$);
    reject('abort');
  }

  private static onerror(event$: ProgressEvent<FileReader>, reject: (reason?: any) => void) {
    console.debug("TextFileReader", "onerror", event$);
    reject('error');
  }

  private static onload(event$: ProgressEvent<FileReader>, result: string | ArrayBuffer | null, resolve: (value: (PromiseLike<string> | string)) => void, reject: (reason?: any) => void): void {
    console.debug("TextFileReader", "onload", event$);
    if (!!result && !!result.toString()) {
      resolve(result.toString());
    } else {
      reject("result is empty");
    }
  }

  private static onloadend(event$: ProgressEvent<FileReader>) {
    console.debug("TextFileReader", "onloadend", event$);
  }

  private static onloadstart(event$: ProgressEvent<FileReader>) {
    console.debug("TextFileReader", "onloadstart", event$);
  }

  private static onprogress(event$: ProgressEvent<FileReader>) {
    console.debug("TextFileReader", "onprogress", event$);
  }

  private static supportWorkers() {
    return typeof Worker !== 'undefined';
  }
}
