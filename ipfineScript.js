var MapRequirements = new Map();
var ArrayResults = [];
var index;

class Results {
  constructor() {
    this.name;
    this.description;
    this.netAddress;
    this.broadcast;
    this.hosts;
    this.firsIP;
    this.lastIP;
    this.masc;
    this.mascBinary;
    this.totalSubnets;
    this.hostsRequested;
    this.hostsProvided;
    this.wastedHosts;
    this.efficiency;
  }
}

class VlsmResults {
  constructor() {
    this.totalSubnets;
    this.hostsRequested;
    this.hostsProvided;
    this.wastedHosts;
    this.efficiency;
    this.remainingAddresses;
  }
}

var vlsm = new VlsmResults()

class NetworkAddress {
  constructor() {
    this.network = document.getElementById("network-address");
    this.informationNet = document.getElementById("network-address-error");
    this.cidr = document.getElementById("cidr");
    this.octects;

    this.setListener();
  }

  setListener() {
    this.network.addEventListener("input", () => {
      this.setResults();
    })

    this.cidr.addEventListener("input", () => {
      this.setResults();
      document.getElementById("cidr-information").textContent = this.cidr.value;
    })
  }

  isValid() {
    var length = this.network.value.length

    if (length > 0) {
      const ipv4 = /^(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)){3}$/
      const isNumber = this.network.value[length - 1].match(/[0-9.]/);

      const result = ipv4.test(this.network.value);

      if (result) {
        this.setColorInformation("Formato de Direccion de red Valido", "var(--cyan)")
        return true;

      } else {
        this.setColorInformation("Formato de Direccion de red Invalido", "var(--magenta)")
      }

      if (!isNumber) {
        this.network.value = this.network.value.slice(0, -1);
      }
    }

    length = this.network.value.length

    if (length == 0) {
      this.setColorInformation("Ingrese una Direccion de red", "var(--purple)")
      this.setInformationError("La Direccion de red esta vacia");
      return false;
    }

    this.setInformationError("La Direccion de red es Invalida");
    return false;
  }

  setResults() {
    if (!this.isValid()) {
      return;
    }

    ArrayResults = [];

    MapRequirements = new Map(
      [...MapRequirements.entries()].sort(
      (a, b) => b[1].hosts.value - a[1].hosts.value
    ));

    this.setOctects();

    var numberHosts = 0;
    var sumHostsRequested = 0;
    var tempNet = this.network.value;

    for (var [key, value] of MapRequirements) {
      var res = new Results();

      this.calcMasc(parseInt(value.hosts.value), res)

      numberHosts += res.hosts;
      sumHostsRequested += parseInt(value.hosts.value);

      res.netAddress = tempNet;
      res.broadcast = this.addIP(numberHosts - 1);
      res.firsIP = this.addIP(numberHosts - res.hosts + 1);
      res.lastIP = this.addIP(numberHosts - 2);

      res.hostsRequested = value.hosts.value;
      res.hostsProvided = res.hosts;
      res.wastedHosts = res.hostsProvided - res.hostsRequested;
      res.efficiency = (100 * res.hostsRequested / res.hostsProvided).toFixed(1) + "%"

      if (value.name.value.length === 0) {
        res.name = value.name.placeholder;
      } else {
        res.name = value.name.value;
      }

      res.description = value.description.value

      ArrayResults.push(res);

      tempNet = this.addIP(numberHosts);
    }

    vlsm.totalSubnets = numberWithCommas(MapRequirements.size);
    vlsm.hostsRequested = numberWithCommas(sumHostsRequested);
    vlsm.hostsProvided = numberWithCommas(numberHosts - 2);
    vlsm.wastedHosts = numberWithCommas(numberHosts - sumHostsRequested);
    vlsm.efficiency = (100 * vlsm.hostsRequested / vlsm.hostsProvided).toFixed(1) + "%";
    vlsm.remainingAddresses = numberWithCommas(Math.pow(2, 32 - parseInt(cidr.value)) - numberHosts);

    if (vlsm.remainingAddresses < 0) {
      this.setInformationError("Insuficiente espacio para todos los requerimientos")
      return;
    }

    this.setInformationSubnet();
    this.setCalculatorResults();
  }

  setColorInformation(information, color) {
    this.informationNet.textContent = information;
    this.informationNet.style.color = color;
    this.network.style.borderColor = color;
  }

  setOctects() {
    this.octects = this.network.value.split(".", 4);
  }

  calcMasc(hosts, results) {
    var i = 0;
    var maxHosts = 0;

    results.masc = 0;
    results.mascBinary = "";

    var isRunning = true;

    do {
      maxHosts = Math.pow(2, i);

      if (maxHosts > hosts) {
        results.masc = 32 - i;

        var k = 1;
        for (var j = 0; j < results.masc; j++) {
          results.mascBinary = results.mascBinary + "1";
          if (k % 8 == 0) {
            results.mascBinary = results.mascBinary + ".";
          }
          k++;
        }
        for (var j = 0; j < i; j++) {
          results.mascBinary = results.mascBinary + "0";
          if (k % 8 == 0 && k != 32) {
            results.mascBinary = results.mascBinary + ".";
          }
          k++;
        }

        isRunning = false;
      }
      i++;
    } while (isRunning);

    results.hosts = maxHosts;
  }

  addIP(hosts) {
    var isRunning = true;
    var i = 3;
    var ipSumed = "";

    var sum = hosts += parseInt(this.octects[i])

    do {
      var dec = Math.trunc(sum / 256);
      var inv = Math.trunc(sum % 256);

      if (i == 3) {
        ipSumed = inv + ipSumed;
      } else {
        ipSumed = inv + "." + ipSumed;
      }

      i--;

      if (i > -1) {
        sum = dec + parseInt(this.octects[i])
        if (i == 0 && sum > 255) {
          return false;
        }
      }
    } while (isRunning && i > -1);

    return ipSumed;
  }

  setInformationError(message) {
    document.getElementById("calculator-results").replaceChildren();

    const frag = document.createDocumentFragment();

    const title = document.createElement("div");
    title.className = "calculator-information-title"
    title.textContent = "Error De Calculo";
    frag.appendChild(title);

    const messageText = document.createElement("div")
    messageText.className = "resultsBox-message";
    messageText.textContent = message;
    frag.appendChild(messageText)

    var calculatorInformation = document.getElementById("calculator-information");
    calculatorInformation.style.borderColor = "var(--magenta)"
    calculatorInformation.style.backgroundColor = "var(--dark-magenta)"
    calculatorInformation.replaceChildren(frag);
  }

  setInformationSubnet() {
    const frag = document.createDocumentFragment();

    const title = document.createElement("div");
    title.className = "calculator-information-title";
    title.textContent = "Resultados del calculo VLSM";
    frag.appendChild(title);

    const resultsBox = document.createElement("div");
    resultsBox.className = "resultsBox";
    frag.appendChild(resultsBox);

    var vlsmTitles = new Map([
      ["Subnets Totales", vlsm.totalSubnets],
      ["Hosts Requeridos", vlsm.hostsRequested],
      ["Hosts Proporcionados", vlsm.hostsProvided],
      ["Hosts Desperdiciados", vlsm.wastedHosts],
      ["Eficiencia", vlsm.efficiency],
      ["Direcciones Restantes", vlsm.remainingAddresses]
    ]);

    for (var [key, value] of vlsmTitles) {
      const resultsBoxItems = document.createElement("div");
      resultsBoxItems.className = "resultsBox-items";
      resultsBox.appendChild(resultsBoxItems);

      const resultsBoxTitle = document.createElement("div");
      resultsBoxTitle.className = "resultsBox-items-title";
      resultsBoxTitle.textContent = key;
      resultsBoxItems.appendChild(resultsBoxTitle);

      const resultsBoxValue = document.createElement("div");
      resultsBoxValue.className = "resultsBox-items-value";
      resultsBoxValue.textContent = value;
      resultsBoxItems.appendChild(resultsBoxValue);
    }
    const calculatorInformation = document.getElementById("calculator-information");
    calculatorInformation.style.borderColor = "var(--cyan)"
    calculatorInformation.style.backgroundColor = "var(--dark-cyan)"
    calculatorInformation.replaceChildren(frag);
  }

  setCalculatorResults() {
    const arrayTitles = [
      "Subnets",
      "Redes",
      "Hosts",
      "Masc",
      "Eficiencia",
    ];

    const frag = document.createDocumentFragment();

    const title = document.createElement("div");
    title.className = "calculator-results-title";
    title.textContent = "Subnets Calculados";
    frag.appendChild(title);

    const container = document.createElement("div");
    container.className = "calculator-results-container";
    frag.appendChild(container);

    const topContainer = document.createElement("div");
    topContainer.className = "calculator-results-topContainer";
    container.appendChild(topContainer);

    for (var singleTitle of arrayTitles) {
      const item = document.createElement("div");
      item.className = "calculator-results-topContainer-items";
      item.textContent = singleTitle;
      topContainer.appendChild(item);
    }

    for (var item of ArrayResults) {
      const bottomContainer = document.createElement("div");
      bottomContainer.className = "calculator-results-bottomContainer";
      container.appendChild(bottomContainer);

      const subnetContainer = document.createElement("div");
      bottomContainer.appendChild(subnetContainer);

      const networkContainer= document.createElement("div");
      bottomContainer.appendChild(networkContainer);

      const hostsContainer = document.createElement("div");
      bottomContainer.appendChild(hostsContainer);

      const mascContainer= document.createElement("div");
      bottomContainer.appendChild(mascContainer);

      const efficiencyContainer = document.createElement("div");
      bottomContainer.appendChild(efficiencyContainer);

      const nameSubnet = document.createElement("div");
      nameSubnet.className = "calculator-results-name";
      nameSubnet.textContent = item.name;
      subnetContainer.appendChild(nameSubnet);

      const description = document.createElement("div");
      description.className = "calculator-results-description";
      description.textContent += item.description;
      subnetContainer.appendChild(description);

      const network = document.createElement("div");
      network.className = "calculator-results-network";
      network.textContent += item.netAddress + "/" + item.masc;
      networkContainer.appendChild(network);

      const firstIP = document.createElement("div");
      firstIP.className = "calculator-results-IP";
      firstIP.textContent += item.firsIP + " -";
      networkContainer.appendChild(firstIP);

      const lastIP = document.createElement("div");
      lastIP.className = "calculator-results-IP";
      lastIP.textContent += item.lastIP;
      networkContainer.appendChild(lastIP);

      const broadcast = document.createElement("div");
      broadcast.className = "calculator-results-broadcast";
      broadcast.textContent += item.broadcast;
      networkContainer.appendChild(broadcast);

      const hostsRequested = document.createElement("div");
      hostsRequested.className = "calculator-results-hostsRequested";
      hostsRequested.textContent += item.hostsRequested + " requeridos";
      hostsContainer.appendChild(hostsRequested);

      const hostsProvided = document.createElement("div");
      hostsProvided.className = "calculator-results-hostsProvided";
      hostsProvided.textContent += item.hostsProvided + " proporcionados";
      hostsContainer.appendChild(hostsProvided);

      const wastedHosts = document.createElement("div");
      wastedHosts.className = "calculator-results-wastedHosts";
      wastedHosts.textContent += item.wastedHosts + " desperdiciados";
      hostsContainer.appendChild(wastedHosts);

      const mascBinary = document.createElement("div");
      mascBinary.className = "calculator-results-mascBinary";
      mascBinary.textContent += item.mascBinary;
      mascContainer.appendChild(mascBinary);

      const efficiency = document.createElement("div");
      efficiency.className = "calculator-results-efficiency";
      efficiency.textContent += item.efficiency;
      efficiencyContainer.appendChild(efficiency);
    }

    document.getElementById("calculator-results").replaceChildren(frag);
  }
}

class Requirement {
  constructor(index, network, _networkAdress) {
    this.index = index;
    this.network = network;
    this._networkAdress = _networkAdress;
    this.name;
    this.namePlaceholder;
    this.hosts;
    this.description;
    this.isValid;
    this.addRequirements();
  }

  addRequirements() {
    const frag = document.createDocumentFragment();

    const calculatorRequirements = document.createElement("div");
    calculatorRequirements.className = "calculator-requirements";
    frag.appendChild(calculatorRequirements);

    const circle = document.createElement("div");
    circle.className = "circle";
    calculatorRequirements.appendChild(circle);

    const circleIndex = document.createElement("p");
    circleIndex.className = "circle-index";
    circleIndex.textContent = this.index;
    circle.appendChild(circleIndex);

    const requirementsLines = document.createElement("div");
    requirementsLines.className = "requirements-lines";
    calculatorRequirements.appendChild(requirementsLines);

    const firstLine = document.createElement("div");
    firstLine.className = "first-line";
    requirementsLines.appendChild(firstLine);

    const subnetInput = document.createElement("input");
    subnetInput.id = "subnet-input";
    subnetInput.type = "text";
    subnetInput.placeholder = "Subnet " + this.index;
    subnetInput.value = "Subnet " + this.index;
    this.name = subnetInput;
    firstLine.appendChild(subnetInput);

    const requirementsText = document.createElement("p");
    requirementsText.className = "requirements-text";
    requirementsText.textContent = "Cantidad Hosts";
    firstLine.appendChild(requirementsText);

    const numberHosts = document.createElement("input");
    numberHosts.className = "number-hosts";
    numberHosts.type = "text";
    numberHosts.placeholder = "50";
    numberHosts.value ="50";
    this.hosts = numberHosts;
    firstLine.appendChild(numberHosts);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Borrar";
    firstLine.appendChild(deleteButton);

    const secondLine = document.createElement("div");
    secondLine.className = "second-line";
    requirementsLines.appendChild(secondLine);

    const description = document.createElement("input");
    description.id = "description";
    description.type = "text";
    description.placeholder = "Descripcion (opcional)";
    this.description = description;
    secondLine.appendChild(description);

    deleteButton.addEventListener("click", () => {
      if (MapRequirements.size == 1) {
        return;
      }
      calculatorRequirements.remove();
      MapRequirements.delete(this.index);
      this.network.setResults();
      index -= 1;
    });

    subnetInput.addEventListener("input", () => {
      this._networkAdress.setResults();
    })

    description.addEventListener("input", () => {
      this._networkAdress.setResults();
    })

    numberHosts.addEventListener("input", () => {
      this._networkAdress.setResults();
    })

    numberHosts.addEventListener("input", () => {
      const length = this.hosts.value.length;
      if (length > 0) {
        const isNumber = this.hosts.value[length - 1].match(/[0-9]/);

        if (this.hosts.value[length - 1] === " ") {
          this.hosts.value = this.hosts.value.slice(0, -1);
        } else if (!isNumber) {
          this.hosts.value = this.hosts.value.slice(0, -1);
        } else if (length === 1 && isNumber[0] === "0") {
          this.hosts.value = 1;
        }
      } else {
        this.hosts.value = 1;
      }
      this.network.setResults();
    });

    document.getElementById("calculator-list").appendChild(frag);
    MapRequirements.set(this.index, this);
    this.network.setResults();
  }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

index = 1;
var netAddress = new NetworkAddress()
new Requirement(index, netAddress, netAddress);

document.getElementById("add-subnet").addEventListener("click", function() {
  index += 1
  new Requirement(index, netAddress, netAddress);
})




