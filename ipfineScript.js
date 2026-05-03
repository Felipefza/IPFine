var MapRequirements = new Map();
var ArrayResults = [];

class results {
  constructor() {
    this.netAdress;
    this.broadcast;
    this.firsIP;
    this.lastIP;
    this.masc;
    this.mascBinary;
    this.hosts;
  }
}

class Requirement {
  constructor(index) {
    this.index = index,
    this.name,
    this.hosts,
    this.description,
    this.addRequirements()
  }

  addRequirements() {
    const frag = document.createDocumentFragment();

    const calculatorRequirements = document.createElement("div");
    calculatorRequirements.className = "calculator-requirements";

    const circle = document.createElement("div");
    circle.className = "circle";

    const circleIndex = document.createElement("p");
    circleIndex.className = "circle-index";
    circleIndex.textContent = this.index;

    const requirementsLines = document.createElement("div");
    requirementsLines.className = "requirements-lines";

    const firstLine = document.createElement("div");
    firstLine.className = "first-line";

    const subnetInput = document.createElement("input");
    subnetInput.className = "subnet-input";
    subnetInput.type = "text";
    subnetInput.placeholder = "Nombre del Subnet";
    subnetInput.value = "Subnet " + this.index;
    this.subnetInput = subnetInput;

    const requirementsText = document.createElement("p");
    requirementsText.className = "requirements-text";
    requirementsText.textContent = "Cantidad Hosts";

    const numberHosts = document.createElement("input");
    numberHosts.className = "number-hosts";
    numberHosts.type = "text";
    numberHosts.placeholder = "50";
    numberHosts.value ="50";
    this.hosts = numberHosts;

    const deleteButton = document.createElement("button");
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Borrar";

    const secondLine = document.createElement("div");
    secondLine.className = "second-line";

    const description = document.createElement("input");
    description.className = "description";
    description.type = "text";
    description.placeholder = "Descripcion (opcional)";
    this.description = description;

    frag.appendChild(calculatorRequirements);

    calculatorRequirements.appendChild(circle);
    circle.appendChild(circleIndex);

    calculatorRequirements.appendChild(requirementsLines);

    requirementsLines.appendChild(firstLine);
    firstLine.appendChild(subnetInput);
    firstLine.appendChild(requirementsText);
    firstLine.appendChild(numberHosts);
    firstLine.appendChild(deleteButton);

    requirementsLines.appendChild(secondLine);
    secondLine.appendChild(description);


    deleteButton.addEventListener("click", () => {
      if (MapRequirements.size == 1) {
        return;
      }
      calculatorRequirements.remove();
      MapRequirements.delete(this.index);
    });

    document.getElementById("calculator-list").appendChild(frag);
    MapRequirements.set(this.index, this);
  }
}

class NetworkAddress {
  constructor() {
    this.network = document.getElementById("network-address");
    this.informationNet = document.getElementById("network-address-error");

    this.octects;

    this.network.addEventListener("input", () => {
      this.isValid();
    }
  )}

  isValid() {
    var length = this.network.value.length

    if (length > 0) {
      const ipv4 = /^(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)){3}$/
      const isNumber = this.network.value[length - 1].match(/[0-9.]/i);

      if (!isNumber) {
        this.network.value = this.network.value.slice(0, -1);
      }

      const result = ipv4.test(this.network.value);

      if (result) {
        this.setColorInformation("Formato de Direccion de red Valido", "var(--cyan)")
        this.setOctects();
      } else {
        this.setColorInformation("Formato de Direccion de red Invalido", "var(--magenta)")
      }
    }

    length = this.network.value.length

    if (length == 0) {
      this.setColorInformation("Ingrese una Direccion de red", "var(--purple)")
    }
  }

  setColorInformation(information, color) {
    this.informationNet.textContent = information;
    this.informationNet.style.color = color;
    this.network.style.borderColor = color;

  }

  setOctects() {
    this.octects = this.network.value.split(".", 4);
    console.log(this.octects);
  }

  calcMasc(hosts, results) {
    var i = 0;
    var maxHosts = 0;

    var isRunning = true;

    do {
      maxHosts = Math.pow(2, i);

      if (maxHosts > hosts) {
        results.masc = 32 - i;

        var k = 1;
        for (var j = 0; j < masc; j++) {
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

  sumIP(hosts) {
    var isRunning = true;
    var i = 3;
    var ipSumed = "";

    var sum = hosts += parseInt(this.octects[i])

    do {
      var dec = sum / 256;
      var inv = sum % 256;

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

    return true;
  }
}

var index = 1;
new Requirement(index);
new NetworkAddress().isValid();


document.getElementById("add-subnet").addEventListener("click", function() {
  index += 1
  new Requirement(index);
})







