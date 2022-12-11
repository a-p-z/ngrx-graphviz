/// <reference lib="webworker" />

addEventListener('message', ({data}) => {
  try {
    const reader = new FileReaderSync();
    const result = reader.readAsText(data);
    postMessage({result});
  } catch (error){
    postMessage({error});
  } finally {
    close();
  }
});
