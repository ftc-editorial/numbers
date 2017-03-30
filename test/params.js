function test({param1=1, param2=2, param3} = {}) {
  console.log(param1);
  console.log(param2);
  console.log(param3);
}

test();