import productModel from '../models/productModel.js'

// get all products
// GET

export const GET_ALL_PRODUCT = async (req, res) => {
    try {
        const search = req.query.search || '';
        const category = req.query.category || '';
        const type = req.query.type || 'all';
        const subcategory = req.query.subcategory || 'all';
        const maxPrice = req.query.price || 999;
        const sort = req.query.sort || 'asc';
        const limit = req.query.limit || 999;

        let sortBy = {};
        if (sort === 'asc' || sort === 'desc') {
            sortBy.price = sort;
        } else {
            sortBy.price = 'asc';
        }

        const query = {
            title: { $regex: search, $options: 'i' },
            price: { $lte: maxPrice },
            subcategory: { $in: [subcategory] },
            type: { $in: [type] },
        };

        if (category) {
            query.category = { $in: [category] };
        }

        const getAllProduct = await productModel
            .find(query)
            .sort(sortBy)
            .limit(parseInt(limit, 10)); // Parsing the limit to integer

        res.status(200).json(getAllProduct);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// get a product by id
// GET
export const GET_PRODUCT = async (req, res) => {
    try {
        const { id } = req.params
        const getProduct = await productModel.findById(id)
        res.status(200).json(getProduct)
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}

// Update a product
// PUT
export const UPDATE_PRODUCT = async (req, res) => {
    try {
        const { id } = req.params
        const updatedProduct = await productModel.findByIdAndUpdate(req.params.id, 
            { $set: req.body }, 
            { new: true})

        // If product id not found
        if (!updatedProduct) {
            return res.status(404).json({message : `Cannot find product with ID of ${id}`})
        }

        res.status(200).json(updatedProduct)
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}

// Update many product
// PUT
export const UPDATE_MANY_PRODUCTS = async (req, res) => {
    try {
        const updateProducts = req.body
        const updatedProducts = await Promise.all(
            updateProducts.map(async (update) => {
                const { _id, ...updateFields} = update;

                return await productModel.findByIdAndUpdate(
                    _id,
                    { $set: updateFields },
                    { new: true }
                )
            })
        );

        // If id not found or any other properties did not match
        const notFound = updatedProducts.some((product) => !product)
        if (notFound) {
            return res.status(404).json({message : `some products not found`})
        }
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

// create a product
// POST
export const CREATE_PRODUCT = async (req, res) => {
    try {
        const products = await productModel.create(req.body)
        res.status(201).json(products)
    } catch(error) {
        res.status(500).json({message : error.message})
    }
}

// delete a product
// DELETE
export const DELETE_PRODUCT = async (req, res) => {
    try {
        const { id } = req.params
        const product = await productModel.findByIdAndDelete(id)
        if (!product) {
            return res.status(404).json({message : `Cannot find and delete product with ID of ${id}`})
        }
        res.status(200).json(product)
    } catch (error) {
        res.status(500).json({message : error.message})
    }
}