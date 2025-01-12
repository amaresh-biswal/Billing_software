let productCount = 0;

function addProducts() {
  productCount = parseInt(document.getElementById("noOfProducts").value);
  const productInputs = document.getElementById("product-inputs");
  productInputs.innerHTML = "";

  for (let i = 0; i < productCount; i++) {
    const productForm = `
      <div class="product">
        <label for="productName${i}">Product Name:</label>
        <input type="text" id="productName${i}" required>

        <label for="mrp${i}">MRP:</label>
        <input type="number" id="mrp${i}" step="any" required>

        <label for="discount${i}">Discount (%):</label>
        <input type="number" id="discount${i}" step="any" required>

        <label for="quantity${i}">Quantity:</label>
        <input type="number" id="quantity${i}" required>
      </div>
    `;
    productInputs.innerHTML += productForm;
  }
}

function calculateTotal(productDetails) {
  return productDetails.reduce((total, product) => {
    const discountedPrice =
      product.mrp - (product.mrp * product.discount) / 100;
    const gstPrice = discountedPrice * 1.12; // Adding 6% CGST + 6% SGST
    return total + gstPrice * product.quantity;
  }, 0);
}

document.getElementById("bill-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const invoiceNo = document.getElementById("invoiceNo").value;
  const patientName = document.getElementById("patientName").value;
  const patientAge = document.getElementById("patientAge").value;
  const patientGender = document.getElementById("patientGender").value;
  const currentDate = new Date();

  const productDetails = [];
  for (let i = 0; i < productCount; i++) {
    const name = document.getElementById(`productName${i}`).value;
    const mrp = parseFloat(document.getElementById(`mrp${i}`).value);
    const discount = parseFloat(document.getElementById(`discount${i}`).value);
    const quantity = parseInt(document.getElementById(`quantity${i}`).value);

    if (
      !name ||
      isNaN(mrp) ||
      isNaN(discount) ||
      isNaN(quantity) ||
      quantity <= 0
    ) {
      alert("Please fill all product details correctly.");
      return;
    }

    productDetails.push({ name, mrp, discount, quantity });
  }

  const total = Math.round(calculateTotal(productDetails));

  let billHTML = `
    <h1>Invoice</h1>
    <p><strong>Invoice No:</strong> ${invoiceNo}</p>
    <p><strong>Date:</strong> ${currentDate.toLocaleDateString()} ${currentDate.toLocaleTimeString()}</p>
    <p><strong>Patient:</strong> ${patientName} <br/> <strong>Age:</strong> ${patientAge}, <strong>Gender:</strong> ${patientGender}</p>
    <table border="1">
      <thead>
        <tr>
          <th>Sl. No.</th>
          <th>Product</th>
          <th>Quantity</th>
          <th>MRP</th>
          <th>Discount</th>
          <th>CGST + SGST</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
  `;

  productDetails.forEach((product, index) => {
    const discountedPrice =
      product.mrp - (product.mrp * product.discount) / 100;
    const gstPrice = discountedPrice * 1.12; // Adding 12% GST
    const totalProductPrice = gstPrice * product.quantity;

    billHTML += `
      <tr>
        <td>${index + 1}</td>
        <td>${product.name}</td>
        <td>${product.quantity}</td>
        <td>${product.mrp.toFixed(2)}</td>
        <td>${product.discount.toFixed(2)}%</td>
        <td>${(gstPrice - discountedPrice).toFixed(2)}</td>
        <td>${totalProductPrice.toFixed(2)}</td>
      </tr>
    `;
  });

  billHTML += `
      </tbody>
    </table>
    <p><strong>Total (Rounded):</strong> ₹${total}</p>
  `;

  document.getElementById("bill-display").innerHTML = billHTML;

  // Show download button
  const downloadButton = document.getElementById("downloadPdf");
  downloadButton.style.display = "block";

  // Add event listener for PDF download
  downloadButton.onclick = function () {
    const doc = new jsPDF();
    doc.fromHTML(billHTML, 10, 10);
    doc.save(`${invoiceNo}_bill.pdf`);
  };

  document.getElementById("downloadPdf").onclick = function () {
    const invoiceContent = document.getElementById("bill-display");
    html2canvas(invoiceContent).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const { jsPDF } = window.jspdf; // Correctly import jsPDF
      const doc = new jsPDF();
      const imgWidth = 190;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      doc.save(`${invoiceNo}_bill.pdf`);
    });
  };
});
