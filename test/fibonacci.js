function* fibonacci(initial) {
  let current = 0;
  let next = initial;
  while (true) {
    yield next;
    [current, next] = [next, current + next];
  }
}
