const STORAGE_KEY = 'productInventoryData';
const inventory = [];

        function saveInventory() {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
        }

        function loadInventory() {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (!storedData) return;

            try {
                const parsed = JSON.parse(storedData);
                if (Array.isArray(parsed)) {
                    inventory.length = 0;
                    parsed.forEach(item => {
                        inventory.push({
                            name: item.name || '',
                            quantity: Number(item.quantity) || 0,
                            price: Number(item.price) || 0,
                        });
                    });
                }
            } catch (error) {
                console.error('Failed to load inventory from localStorage', error);
            }
        }

        function addProduct() {
            const name = document.getElementById('productName').value;
            const quantity = parseInt(document.getElementById('quantity').value);
            const price = parseFloat(document.getElementById('price').value);

            let verificationName = document.getElementById('productName').value.toLowerCase();

            if (!name && !verificationName || isNaN(quantity) || isNaN(price)) {
                alert('Please fill in all fields with valid values.');
                return;
            }

            if (inventory.some(product => product.name === name || product.name.toLowerCase() === verificationName)) {
                alert('Product already exists. Please use the update function to modify it.');
                return;
            }

            inventory.push({ name, quantity, price });
            saveInventory();
            updateTable();
        }

        function updateTable() {
            const tbody = document.querySelector('#inventoryTable tbody');
            tbody.innerHTML = '';

            inventory.forEach((product, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>$${(product.quantity * product.price).toFixed(2)}</td>
                `;
                tbody.appendChild(row);
            });
        }

        function deleteProduct() {
            const name = document.getElementById('productName').value;
            let verificationName = document.getElementById('productName').value.toLowerCase();
            if (!name && !verificationName) {
                alert('Please enter a product name to delete.');
                return;
            }

            const index = inventory.findIndex(product => product.name === name || product.name.toLowerCase() === verificationName);
            if (index !== -1) {
                inventory.splice(index, 1);
                saveInventory();
                updateTable();
            } else {
                alert('Product not found.');
            }
        }

        function updateProduct() {
            const name = document.getElementById('productName').value;
            const quantity = parseInt(document.getElementById('quantity').value);
            const price = parseFloat(document.getElementById('price').value);

            let verificationName = document.getElementById('productName').value.toLowerCase();

            if (!name && !verificationName || isNaN(quantity) || isNaN(price)) {
                alert('Please fill in all fields with valid values.');
                return;
            }

            const index = inventory.findIndex(product => product.name === name || product.name.toLowerCase() === verificationName);
            if (index !== -1) {
                inventory[index] = { name, quantity, price };
                saveInventory();
                updateTable();
            } else {
                alert('Product not found.');
            }
        }

        function searchProduct() {
            const name = document.getElementById('productName').value;
            let verificationName = document.getElementById('productName').value.toLowerCase();
            const product = inventory.find(item => item.name === name || item.name.toLowerCase() === verificationName);

            if (product) {
                document.getElementById('quantity').value = product.quantity;
                document.getElementById('price').value = product.price;
                updateSearchTable(product);
            } else {
                alert('Product not found.');
                hideSearchResults();
            }
        }

        function updateSearchTable(product) {
            const tbody = document.querySelector('#hiddenSearchTable tbody');
            tbody.innerHTML = '';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.quantity}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>$${(product.quantity * product.price).toFixed(2)}</td>
            `;
            tbody.appendChild(row);

            document.getElementById('searchResultsContainer').classList.add('visible');
        }

        function hideSearchResults() {
            document.getElementById('searchResultsContainer').classList.remove('visible');
        }

        window.addEventListener('DOMContentLoaded', () => {
            loadInventory();
            updateTable();
            hideSearchResults();
        });
