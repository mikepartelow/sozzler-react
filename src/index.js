import React from 'react';
import ReactDOM from 'react-dom';
import {Helmet} from "react-helmet";
import './index.css';

function fancy_quantity(quantity) {
  let [qn, qd] = quantity.split('/')

  if (qn === '0') {
    quantity = ''
  } else if (qd === '1') {
    quantity = qn
  } else {
    let [ qni, qdi ] = [ parseInt(qn, 10), parseInt(qd, 10) ]
    if (qni > qdi) {
      quantity = `${Math.floor(qni/qdi)} ${qni%qdi}/${qdi}`
    }
  }

  return quantity
}

function RecipeDetails(props) {
  return (
    <div>
      <Helmet>
        <title>{props.recipe.name}</title>
      </Helmet>

      <div className="recipe-details">
        <div className="name">
          <h3>{props.recipe.name} : {props.recipe.rating}</h3>
        </div>
        {props.recipe.components.sort((c0, c1) => c0.index > c1.index).map((c) =>        
          <div key={c.index} className="component">
            <span className="quantity">{fancy_quantity(c.quantity)} </span>
            <span className="unit">{c.unit} </span>
            <span className="ingredient">{c.ingredient}</span>
          </div>
        )}        
        <hr />
        <div className="text">
          {props.recipe.text}
        </div>
      </div>
    </div>
  );
}

class Recipe extends React.Component {
  render() {
    const ingredients = this.props.recipe.components.sort((c0, c1) => c0.index > c1.index).map((component) =>
        component.ingredient
    ).join(', ');

    return (
      <li className="recipe" onClick={() => this.props.onRecipeSelected(this.props.recipe)}>
        <div className="name">
          {this.props.recipe.name} : {this.props.recipe.rating}
        </div>
        <div className="ingredients">
          {ingredients}
        </div>
      </li>
    );
  }
}

class RecipeList extends React.Component {  
  render() {
    return (
      <div>
        <Helmet><title>{this.props.ingredient ? "Recipes With " + this.props.ingredient : "Recipes"}</title></Helmet>
        <ul className="recipes">
          {this.props.recipes.sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name))
                             .filter((recipe) => recipe.name.toLowerCase().includes(this.props.filterText.toLowerCase()))
                             .map((recipe) => <Recipe key={recipe.name} recipe={recipe} onRecipeSelected={this.props.onRecipeSelected} />)
          }
        </ul>
      </div>
    );
  }
}

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
  }
  
  handleFilterTextChange(e) {
    this.props.onFilterTextChange(e.target.value);
  }
  
  render() {
    return (
      <form>
        <input
          type="text"
          placeholder="Search..."
          value={this.props.filterText}
          onChange={this.handleFilterTextChange}
        />
      </form>
    );
  }
}

class FilteredRecipeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filterText: '',
    };
    this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
  }

  handleFilterTextChange(filterText) {
    this.setState({
      filterText: filterText
    });
  }

  render() {
    return (
      <div>
        <SearchBar filterText={this.state.filterText} onFilterTextChange={this.handleFilterTextChange} />
        <RecipeList recipes={this.props.recipes} ingredient={this.props.ingredient} filterText={this.state.filterText} onRecipeSelected={this.props.onRecipeSelected} />
      </div>
    )
  }
}

class Ingredient extends React.Component {
  render() {
    return (
      <li className="ingredient" onClick={() => this.props.onIngredientSelected(this.props.ingredient, this.props.recipes)}>
        <div className="name">
          {this.props.ingredient}
        </div>
        <div className="recipes">
          {this.props.recipes.map(r => r.name).sort().join(', ')}
        </div>
      </li>
    );
  }
}

class IngredientList extends React.Component {
  render() {
    return (
      <div>
        <Helmet><title>Ingredients</title></Helmet>
        <ul className="ingredients">
          {Array.from(this.props.ingredients).map(([k, v]) =>
            <Ingredient key={k} ingredient={k} recipes={v} onIngredientSelected={this.props.onIngredientSelected}/>
          )}
        </ul>
      </div>
    )
  }
}

class MenuBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleRecipes = this.handleRecipes.bind(this);
    this.handleIngredients = this.handleIngredients.bind(this);
  }

  handleRecipes() {
    this.props.onRecipes()
  }

  handleIngredients() {  
    this.props.onIngredients()  
  }

  render() {
    return (
      <div>
        <button onClick={this.handleRecipes}>Recipes</button> |
        <button onClick={this.handleIngredients}>Ingredients</button>
      </div>
    )
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ingredient: null,
      recipes: null,
      selectedRecipe: null,
      ingredientView: false,
    };
    this.handleRecipeSelected = this.handleRecipeSelected.bind(this);
    this.handleRecipes = this.handleRecipes.bind(this);
    this.handleIngredients = this.handleIngredients.bind(this);
    this.handleIngredientSelected = this.handleIngredientSelected.bind(this);
  }

  handleRecipes() {
    this.setState({
      ingredient: null,
      recipes: null,
      selectedRecipe: null,
      ingredientView: false,
    });
  }

  handleIngredients() {
    this.setState({
      ingredientView: true,
    });
  }

  handleRecipeSelected(selectedRecipe) {
    this.setState({
      selectedRecipe: selectedRecipe
    });
  }

  handleIngredientSelected(ingredient, recipes) {
    this.setState({
      ingredient: ingredient,
      recipes: recipes,
      ingredientView: false,
    })
  }

  render() {
    var view;

    if (this.state.ingredientView) {
      view = <IngredientList ingredients={this.props.ingredients} onIngredientSelected={this.handleIngredientSelected} />
    } else if (this.state.selectedRecipe) {
      view = <RecipeDetails recipe={this.state.selectedRecipe} />
    } else {
      view = <FilteredRecipeList recipes={this.state.recipes || this.props.recipes} ingredient={this.state.ingredient} onRecipeSelected={this.handleRecipeSelected} />
    }

    return (
      <div>
        <MenuBar onRecipes={this.handleRecipes} onIngredients={this.handleIngredients} />
        {view}
      </div>
    )
  }
}

// ========================================
let url = 'https://raw.githubusercontent.com/mikepartelow/sozzler-recipes/master/SozzlerApp/1.0.sozzler';
fetch(url)
  .then((res) => res.json())
  .then((recipes) => {
    var ingredients = new Map();

    recipes.map((recipe) =>
      recipe.components.map((component) => {
        var ingredient_recipes = ingredients.get(component.ingredient) || [];
        ingredient_recipes.push(recipe);
        ingredients.set(component.ingredient, ingredient_recipes);
        return null;
      })
    )

    ReactDOM.render(<App recipes={recipes} ingredients={ingredients} />, document.getElementById('root'));
})