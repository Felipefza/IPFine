let MapRequirements = new Map();
index = 0;

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
    this.cidrInformation = document.getElementById("cidr-information");
    this.cidrInputBox = document.getElementById("cidr-input-box");
    this.setListener();
    this.ArrayResults = []

    this.cidr.value = 24;
    this.cidrInformation.textContent = "/" + this.cidr.value;
    this.cidrInputBox.value = this.cidr.value;
  }

  setListener() {
    this.network.addEventListener("input", () => {
      this.setResults();
    })

    this.cidr.addEventListener("input", () => {
      this.cidrInformation.textContent = "/" + this.cidr.value;
      this.cidrInputBox.value = this.cidr.value;
      this.setResults();
    })

    this.cidrInputBox.addEventListener("input", () => {
      var cidrLength = this.cidrInputBox.value.length
      console.log(cidrLength)
      if (cidrLength > 2) {
        this.cidrInputBox.value = this.cidrInputBox.value.slice(0, cidrLength - 1)
      }

      if (this.cidrInputBox.value > 32) {
        this.cidrInputBox.value = 32;
      }
      onlyNumbers(this.cidrInputBox);
      this.cidr.value = this.cidrInputBox.value;
      this.cidrInformation.textContent = "/" + this.cidrInputBox.value;
      this.setResults();
    });
  }

  isNumber(letter) {
    return letter.match(/[0-9.]/);
  }

  isIpv4Valid(address) {
    const ipv4 = /^(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)){3}$/;
    return ipv4.test(address);
  }

  isValid() {
    this.cidr.className = "input-box cidr-magenta";
    var length = this.network.value.length

    if (length > 0) {

      if (!this.isNumber(this.network.value[length - 1])) {
        this.network.value = this.network.value.slice(0, -1);
      }


      if (this.isIpv4Valid(this.network.value)) {
        this.setColorInformation("Formato de Direccion de red Valido", "var(--cyan)")
        this.network.style.backgroundColor = "var(--dark-cyan)"
        this.cidr.className = "input-box cidr-cyan";
        return true;

      }

      this.setColorInformation("Formato de Direccion de red Invalido", "var(--magenta)")
    }

    length = this.network.value.length

    if (length == 0) {
      this.setColorInformation("Ingrese una Direccion de red", "var(--purple)")
      this.setInformationError("La Direccion de red esta vacia");
      return false;
    }

    this.setInformationError("La Direccion de red es Invalida");
    this.network.style.backgroundColor = "var(--dark-magenta)"
    return false;
  }

  setResults() {
    if (!this.isValid()) {
      return;
    }

    this.ArrayResults = [];

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

      this.ArrayResults.push(res);

      tempNet = this.addIP(numberHosts);
    }

    vlsm.totalSubnets = numberWithCommas(MapRequirements.size);
    vlsm.hostsRequested = numberWithCommas(sumHostsRequested);
    vlsm.hostsProvided = numberWithCommas(numberHosts);
    vlsm.wastedHosts = numberWithCommas(numberHosts - sumHostsRequested);
    vlsm.efficiency = (100 * vlsm.hostsRequested / vlsm.hostsProvided).toFixed(1) + "%";
    vlsm.remainingAddresses = numberWithCommas(Math.pow(2, 32 - parseInt(cidr.value)) - numberHosts);

    if (parseInt(vlsm.remainingAddresses) < 0) {
      this.cidr.className = "input-box cidr-magenta";
      this.setInformationError("Insuficiente espacio para todos los requerimientos");
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

      if (maxHosts >= hosts && maxHosts >= 4) { // MINIMO DE HOSTS 4, PORQUE CON MENOS, FALTAN IPS
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

    for (var item of this.ArrayResults) {
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
    this.name = subnetInput;
    firstLine.appendChild(subnetInput);

    const requirementsText = document.createElement("p");
    requirementsText.className = "requirements-text";
    requirementsText.textContent = "Cantidad Hosts";
    firstLine.appendChild(requirementsText);

    const numberHosts = document.createElement("input");
    numberHosts.id = "number-hosts";
    numberHosts.type = "text";
    numberHosts.placeholder = "50";
    numberHosts.value ="50";
    this.hosts = numberHosts;
    firstLine.appendChild(numberHosts);

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    firstLine.appendChild(deleteButton);

    const icon = document.createElement("img");
    icon.id = "trash_icon";
    icon.className = "trash_icon";
    deleteButton.appendChild(icon);

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
      this._networkAdress.setResults();
    });

    subnetInput.addEventListener("input", () => {
      this._networkAdress.setResults();
    })

    description.addEventListener("input", () => {
      this._networkAdress.setResults();
    })

    numberHosts.addEventListener("input", () => {
      onlyNumbers(this.hosts);
      this._networkAdress.setResults();
    });

    document.getElementById("calculator-list").appendChild(frag);
    MapRequirements.set(this.index, this);
    this._networkAdress.setResults();
  }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function onlyNumbers(elementInput) {
  const length = elementInput.value.length;


  if (length > 0) {
    for (var i = 0; i < length; i++) {
      const isNumber = elementInput.value[i].match(/[0-9]/);

      if (elementInput.value[i] === " ") {
        elementInput.value = elementInput.value.slice(0, i) + elementInput.value.slice(i + 1);
      } else if (!isNumber) {
        elementInput.value = elementInput.value.slice(0, i) + elementInput.value.slice(i + 1);
      } else if (length === 1 && isNumber[0] === "0") {
        elementInput.value = 1;
      }
    }
  } else {
    elementInput.value = 1;
  }
}

function changeTheme(theme) {
  var mode = document.getElementById("change-mode");
  mode.src = theme === "light" ? "./assets/images/moon.png" : "./assets/images/sun.png";

  var oldTheme = theme === "light" ? "dark" : "light";

  mode.src = theme === "light" ? "./assets/images/moon.png" : "./assets/images/sun.png";

  document.documentElement.classList.replace(oldTheme, theme);

  icons = document.querySelectorAll(".trash_icon");
  icons.forEach(item=> {
    item.src = theme === "light" ? "./assets/images/trash_light_ICON.png" : "./assets/images/trash_dark_ICON.png";
  });
}

window.addEventListener("DOMContentLoaded", () => {
  let darkModeMql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  let userMode = darkModeMql.matches === true ? "light" : "dark";
  let newMode = userMode === "light" ? "dark" : "light";

  // IF THE USER CHANGE THE OS AND BROWSER THEME
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    const newColorScheme = event.matches ? "dark" : "light";
    changeTheme(newColorScheme);
  });

  document.getElementById("change-mode-button").addEventListener("click", function(){
    newMode = newMode === "light" ? "dark" : "light";
    changeTheme(newMode);

  })

  document.getElementById("add-subnet").addEventListener("click", function() {
    index += 1
    new Requirement(index, netAddress, netAddress, MapRequirements);

    icons = document.querySelectorAll(".trash_icon");
    changeTheme(newMode);

  })

  document.documentElement.classList.add(userMode);

  var netAddress = new NetworkAddress(MapRequirements)
  new Requirement(index, netAddress, netAddress, MapRequirements);
  index++;

  if (darkModeMql && darkModeMql.matches) {
    changeTheme("dark");
  } else {
    changeTheme("light");
  }

})
