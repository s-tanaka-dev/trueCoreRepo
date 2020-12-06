var microBitBle;

var gpioPort0;
var gpioPort2;
var connected;

var channel;

async function connect() {
  microBitBle = await microBitBleFactory.connect();
  msg.innerHTML = "micro:bit BLE接続しました。";
  connected = true;

  var relay = RelayServer("achex", "KandKSocket");
  channel = await relay.subscribe("KandKSensors");

  // GPIO
  var gpioAccess = await microBitBle.requestGPIOAccess();
  var mbGpioPorts = gpioAccess.ports;
  gpioPort2 = mbGpioPorts.get(2);
  gpioPort0 = mbGpioPorts.get(0);
  await gpioPort2.export("analogin"); //port2 analogin : pull none
  await gpioPort0.export("out");
  measure();
}

async function disconnect() {
  connected = false;
  await microBitBle.disconnect();
  msg.innerHTML = "micro:bit BLE接続を切断しました。";
}

var status = 0;

async function measure() {
  while (connected) {
    var g2Val = await gpioPort2.read();
    gdata2.innerHTML = g2Val;
    if (g2Val < 500) {
      status = status === "0" ? 1 : 0;
      await gpioPort0.write(status);
    }
    channel.send({ doWake: 0, stPower: status });
    console.log(status);

    await sleep(100);
  }
}
