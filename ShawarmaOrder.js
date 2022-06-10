const Order = require("./Order");
const large = 14;
const medium = 10;
const small = 7;
const toppingCost = 3;
const drinkCost = 5;
const addonCost = 2;

const OrderState = Object.freeze({
    WELCOMING:   Symbol("welcoming"),
    PAYMENT: Symbol("payment"),
    SIZE:   Symbol("size"),
    TOPPINGS:   Symbol("toppings"),
    DRINKS:  Symbol("drinks"),
    ITEM1: Symbol("item1"),
    ITEM2:Symbol("item2"),
    ADDONS: Symbol("addons")
});

module.exports = class ShwarmaOrder extends Order{
    constructor(sNumber, sUrl){
        super(sNumber, sUrl);
        this.stateCur = OrderState.WELCOMING;
        this.sSize = "";
        this.sItem1 = "Nuggets";
        this.sItem2 = "Sandwich";
        this.sItem3 = "Salad";
        this.sFirst_item = "";
        this.sSecond_item="";
        this.sToppings = "";
        this.sDrinks = "";
        this.sSize = "";
        this.total_cost = 0;
    }
    handleInput(sInput){
        let aReturn = [];
        switch(this.stateCur){
          case OrderState.WELCOMING:
                this.stateCur = OrderState.ITEM1;
                aReturn.push("Welcome to Sarwaa Cafe");
                aReturn.push("What would you like to order today ? \n 1. Nuggets  \n 2. Sandwich \n 3. Salad ");
                break;
            case OrderState.ITEM1:
                this.stateCur = OrderState.SIZE;
                this.sSecond_item = sInput;
                this.sFirst_item += sInput;
                if(sInput.toLowerCase() == "nuggets"){
                    this.total_cost += 20;
                }
                else if(sInput.toLowerCase() == "sandwich"){
                    this.total_cost +=13 ;
                }
                else if(sInput.toLowerCase() == "salad"){
                    this.total_cost += 8;
                }
                else{
                  aReturn.push("Invalid Product, please choose from the list provided above.");
                  this.stateCur = OrderState.FIRST_ITEM;
                  break;
                }
                aReturn.push("What size would you like ?");
                break;
            case OrderState.SIZE:
                this.stateCur = OrderState.TOPPINGS
                this.sFirst_item += `(${sInput})`;
                if(sInput.toLowerCase() == "large"){
                    this.total_cost += large;
                }
                else if(sInput.toLowerCase() == "medium"){
                    this.total_cost += medium;
                }
                else if(sInput.toLowerCase() == "small"){
                    this.total_cost += small;
                }
                aReturn.push("What toppings would you like?");
                break;
            case OrderState.TOPPINGS:
                this.stateCur = OrderState.ADDONS
                this.sFirst_item += `with ${sInput}`;
                this.total_cost += toppingCost;
                aReturn.push("Would you like to add our extra cheesy fries as addon at an extra 2$ ?");
                break;
            case OrderState.ADDONS:
              if(sInput.toLowerCase() != "no")
              {
                this.total_cost = this.total_cost + addonCost;
              }
                this.stateCur = OrderState.DRINKS
                this.sFirst_item += ` and ${sInput}`;
                aReturn.push("What drink would you like ? ");
                break;    
            case OrderState.DRINKS:
                this.stateCur = OrderState.ITEM2
                if(sInput.toLowerCase() != "no"){
                  this.total_cost += drinkCost ;
                }
                aReturn.push("Would you like to add another item??");
                break;
            case OrderState.ITEM2:
                if(sInput != "no")
                {
                    this.sFirst_item += `, `;
                    this.sDrinks += `, `;
                    this.stateCur = OrderState.FIRST_ITEM
                    aReturn.push("What would you like to order today ? \n 1. Nuggets  \n 2. Sandwich \n 3. Salad ");
                }
                else
                {
                  this.stateCur = OrderState.PAYMENT;
                    this.total_cost = this.total_cost + this.total_cost*.13;
                    aReturn.push("Thank-you for your order of");
                    aReturn.push(`${this.sFirst_item}`);
                    if(this.sDrinks){
                        aReturn.push(this.sDrinks);
                    }
                    this.nOrder = this.total_cost;
                    aReturn.push(`Total Price = $${this.total_cost}`);
                    aReturn.push(`Please pay for your order here`);
                    aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
                }
                break;
            // case OrderState.DRINKS:
            //     this.stateCur = OrderState.PAYMENT;
            //     this.nOrder = 15;
            //     if(sInput.toLowerCase() != "no"){
            //         this.sDrinks = sInput;
            //     }
            //     aReturn.push("Thank-you for your order of");
            //     aReturn.push(`${this.sSize} ${this.sItem} with ${this.sToppings}`);
            //     if(this.sDrinks){
            //         aReturn.push(this.sDrinks);
            //     }
            //     aReturn.push(`Please pay for your order here`);
            //     aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
            //     break;
            case OrderState.PAYMENT:
                console.log(sInput);
                this.isDone(true);
                let d = new Date();
                d.setMinutes(d.getMinutes() + 20);
                aReturn.push(`Your order will be delivered at ${d.toTimeString()} on 
                ${sInput.purchase_units[0].shipping.address.address_line_1},
                ${sInput.purchase_units[0].shipping.address.address_admin_area_1},
                ${sInput.purchase_units[0].shipping.address.address_admin_area_2},
                ${sInput.purchase_units[0].shipping.address.postal_code},
                ${sInput.purchase_units[0].shipping.address.country_code}`);
                break;
        }
        return aReturn;
    }
    renderForm(sTitle = "-1", sAmount = "-1"){
      // your client id should be kept private
      if(sTitle != "-1"){
        this.sItem = sTitle;
      }
      if(sAmount != "-1"){
        this.nOrder = sAmount;
      }
      const sClientID = process.env.SB_CLIENT_ID || 'put your client id here for testing ... Make sure that you delete it before committing'
      return(`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);
  
    }
}