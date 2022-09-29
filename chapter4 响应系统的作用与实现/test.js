function shuffle(arr) {
  // modify the arr inline to change the order randomly
  if (!Array.isArray(arr)) return;

  const length = arr.length;
  const times = 3;
  const pool = [];
  for (let i = 0; i < length; i++) {
    for (let j = 0; j < length; j++) {
      // pool[i][j] = times * j * i;
    }
  }
  return (function () {
    console.log(1);
  })();
}

shuffle([1, 2, 3]);
