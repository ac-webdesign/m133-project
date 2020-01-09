import * as express from 'express';
import * as products from './products.json';
import { check, validationResult } from 'express-validator';

const router = express.Router();

// GET: index.html - Übersicht
router.get('/', (req, res) => {
    res.render('ejs/index',
        {
            products: products,
            cartAmount: req.session.cookie.cart.size(),
            total: req.session.cookie.cart.getTotal()
        }
    );
});

// GET: cart.html - Warenkorb
router.get('/cart', (req, res) => {
    req.session.cookie.cart.calculateProductAmount();

    res.render('ejs/cart',
        {
            products: req.session.cookie.cart.getUniqueProducts(),
            cartAmount: req.session.cookie.cart.size(),
            total: req.session.cookie.cart.getTotal()
        }
    );
});

// GET: checkout.html - Einkauf abschliessen
router.get('/checkout', (req, res) => {
    res.render('ejs/checkout',
        {
            cartAmount: req.session.cookie.cart.size(),
            total: req.session.cookie.cart.getTotal()
        }
    );
});

// GET: product.html - Produkt - Übersicht
router.get('/products/:id', (req, res) => {
    const id = req.params.id;

    const selectedProduct = loadProduct(id);
    const nextProduct = loadNextProduct(id);
    const previousProduct = loadPreviousProduct(id);

    res.render('ejs/product',
        {
            product: selectedProduct,
            nextProduct: nextProduct,
            previousProduct: previousProduct,
            cartAmount: req.session.cookie.cart.size(),
            total: req.session.cookie.cart.getTotal()
        }
    );
});

// GET: cart.html - Produkt von Warenkorb löschen
router.get('/cart/products/delete/:id', (req, res) => {
    const id = req.params.id;
    const selectedProduct = loadProduct(id);

    req.session.cookie.cart.remove(selectedProduct.id);
    req.session.cookie.cart.calculateProductAmount();
    req.session.cookie.cart.calculateTotal();

    res.render('ejs/cart',
        {
            products: req.session.cookie.cart.getUniqueProducts(),
            cartAmount: req.session.cookie.cart.size(),
            total: req.session.cookie.cart.getTotal()
        }
    );
});

// POST: product.html - Produkt zu Warenkorb hinzufügen
router.post('/products/:id', (req, res) => {
    const id = req.params.id;

    const selectedProduct = loadProduct(id);
    const nextProduct = loadNextProduct(id);
    const previousProduct = loadPreviousProduct(id);

    addProduct(req, selectedProduct);

    res.render('ejs/product',
        {
            product: selectedProduct,
            nextProduct: nextProduct,
            previousProduct: previousProduct,
            cartAmount: req.session.cookie.cart.size(),
            total: req.session.cookie.cart.getTotal()
        }
    );
});

// POST: cart.html - Produkt zu Warenkorb hinzufügen
router.post('/cart/products/:id', (req, res) => {
    const id = req.params.id;
    const selectedProduct = loadProduct(id);

    addProduct(req, selectedProduct);

    res.render('ejs/cart',
        {
            products: req.session.cookie.cart.getUniqueProducts(),
            cartAmount: req.session.cookie.cart.size(),
            total: req.session.cookie.cart.getTotal()
        }
    );
});

// POST: checkout.html - Einkauf abschliessen
router.post('/checkout',
    [
        check('firstname').notEmpty(),
        check('lastname').notEmpty(),
        check('email').notEmpty().isEmail()
    ],
    (req, res) => {
        const errors = validationResult(req);
        const formInvalid = !errors.isEmpty() || req.session.cookie.cart.getTotal() === 0;

        if (formInvalid) {
            res.status(422);
            res.render('ejs/error',
                {
                    cartAmount: req.session.cookie.cart.size(),
                    total: req.session.cookie.cart.getTotal()
                }
            );
        } else {
            res.render('ejs/submit',
                {
                    products: req.session.cookie.cart.getUniqueProducts(),
                    cartAmount: req.session.cookie.cart.size(),
                    total: req.session.cookie.cart.getTotal()
                }
            );

            // Werte zurücksetzen 
            req.session.cookie.cart.products = [];
            req.session.cookie.cart.calculateTotal();
        }
    }
);

// Helper Functions: Products
function loadProduct(id: any) {
    return products.find(p => p.id.toString() === id);
}

function loadPreviousProduct(id: string) {
    const nextProductId = (Number(id) - 1).toString();
    return products.find(p => p.id.toString() === nextProductId);
}

function loadNextProduct(id: string) {
    const nextProductId = (Number(id) + 1).toString();
    return products.find(p => p.id.toString() === nextProductId);
}

function addProduct(req: any, product: any) {
    req.session.cookie.cart.add(product);
    req.session.cookie.cart.calculateProductAmount();
    req.session.cookie.cart.calculateTotal();
}

module.exports = router;