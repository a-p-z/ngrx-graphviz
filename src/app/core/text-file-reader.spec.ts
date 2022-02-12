import {TextFileReader} from "./text-file-reader";
import {Observable} from "rxjs";
import createSpyObj = jasmine.createSpyObj;

describe('TextFileReader', () => {
  const file = new File([], 'test');

  let observable: Observable<string>;
  let textFileReader: TextFileReader;

  beforeEach(() => {
    textFileReader = new TextFileReader();
  });

  it(`supportWorkers should be ${typeof Worker !== 'undefined'}`, () => {
    expect((TextFileReader as any).supportWorkers()).toEqual(typeof Worker !== 'undefined');
  });

  describe('when read sync', () => {
    let worker: any;
    let url: any;

    beforeEach(() => {
      worker = createSpyObj('worker', ['postMessage']);
      url = createSpyObj('url', ['createObjectURL']);
      spyOn((TextFileReader as any), 'supportWorkers').and.returnValue(true);
      spyOn(window, 'URL').and.returnValue(url);
      spyOn(window, 'Worker').and.returnValue(worker);
      observable = textFileReader.read(file);
    });

    it('message should be posted', () => {
      expect(worker.postMessage).toHaveBeenCalledWith(file);
    });

    describe('when reading file succeeds', () => {
      beforeEach(() => {
        worker.onmessage({data: {result: 'text'}});
      });

      it('text should be returned', (done) => {
        observable.subscribe((v) => {
          expect(v).toEqual('text');
          done();
        });
      });
    });

    describe('when reading file fails', () => {
      beforeEach(() => {
        worker.onmessage({data: {error: 'error'}});
      });

      it('error should be returned', (done) => {
        observable.subscribe({
          error: (error) => {
            expect(error).toEqual('error');
            done();
          }
        });
      });
    });
  });

  describe('when read async', () => {
    let fileReader: any;

    beforeEach(() => {
      fileReader = createSpyObj('fileReader', ['readAsText']);
      spyOn((TextFileReader as any), 'supportWorkers').and.returnValue(false);
      spyOn(window, 'FileReader').and.returnValue(fileReader);
      observable = textFileReader.read(file);
    });

    it('fileReader.readAsText should be called', () => {
      expect(fileReader.readAsText).toHaveBeenCalledWith(file);
    });

    describe('when reading file succeeds', () => {
      beforeEach(() => {
        fileReader.result = 'text';
        fileReader.onloadstart({});
        fileReader.onprogress({});
        fileReader.onload({});
        fileReader.onloadend({});
      });

      it('text should be returned', (done) => {
        observable.subscribe((v) => {
          expect(v).toEqual('text');
          done();
        });
      });
    });

    [{onevent: 'onabort', expectedError: 'abort'},
      {onevent: 'onerror', expectedError: 'error'},
      {onevent: 'onload', expectedError: 'result is empty'}].forEach(({onevent, expectedError}) => {
      describe('when reading file fails', () => {
        beforeEach(() => {
          fileReader[onevent]({});
        });

        it('error should be returned', (done) => {
          observable.subscribe({
            error: (error) => {
              expect(error).toEqual(expectedError);
              done();
            }
          });
        });
      });
    });
  });

  afterEach(() => {
    expect().nothing();
  });
});
