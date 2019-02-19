const config = require('config')
var jQuery = require('jquery')
var Swal = require('sweetalert2')
var ko = require('knockout')
var $ = jQuery

var tagreader = require('./tagreader.js')
var data = require('./data.js')

const db = new data.DB(defaultIfUndefined(process.env.SK_MongoDB, config.get('mongo')))

const DEBUG = defaultIfUndefined(process.env.SK_DEBUG, config.get('debug'))

function defaultIfUndefined(vvalue, def){
    return vvalue != undefined ? vvalue : def
}

var logoutTimeoutHandler = null

//################################################################
// View model
//################################################################

function ViewModel(){
    this.uid = ko.observable(undefined)
    this.credit = ko.observable(undefined)
    
    this.footerText = ko.observable("Scan RFID-Tag to login")
}
var viewModel = new ViewModel();
exports.viewModel = viewModel;
ko.applyBindings(viewModel);

//################################################################
// Inputs
//################################################################

// set what to do when a tag is read
tagreader.setOnTagReadCallback(loginByUid)

async function loginByUid(uid) {

    try {
        var account = await db.getAccountByTagID(uid)
    } catch (err) {
        await Swal({
            position: 'top-end',
            type: 'error',
            title: err,
            showConfirmButton: false,
            toast: true,
            timer: 2000
          })
        return
    }

    if (account == null){

        await db.createAccount(uid)

        await Swal({
            title: "Account not found. Creating new one!",
            type: "error",
            timer: 4000
        })

        await Swal({
            title: "Created account. Please retry!",
            type: "info",
            timer: 2000
        })

        return
    }

    onLogin(account)
}

function logoutKeyListener(ev){
    if (ev.key == "/"){
        var event = new Event('logout')
        window.dispatchEvent(event)
    }
}

function addCreditKeyListener(ev){
    if (ev.key == "+"){
        onAddCredit()
    }
}

function removeCreditKeyListener(ev){
    if (ev.key == "-"){
        onRemoveCredit()
    }
}

function debugLoginListener(ev){
    if (ev.key == "l"){
        onDebugLogin()
    }
}


//################################################################
// User interface
//################################################################

function loggedInState(){
    emptyCartState()

    $("#vspaceone_logo > g > path").css({
        fill: "rgb(8, 160, 89)",
        transition: "400ms"
    })

    $('#list').css({
        display: "block"
    })

    $("header").css({
        "background-color": "rgb(8, 160, 89)",
        transition: "400ms"
    })

    window.addEventListener('keyup', logoutKeyListener, true)
    window.addEventListener('keyup', removeCreditKeyListener, true)
    window.addEventListener('keyup', addCreditKeyListener, true)
}

function emptyCartState(){
    viewModel.footerText("/ to logout | - to remove credit | + to add credit")
}

function loggedOutState(){
    viewModel.footerText("Scan RFID-Tag to login")

    $("#vspaceone_logo > g > path").css({
        fill: "rgb(111, 121, 144)",
        transition: "400ms"
    })

    $('#list').css({
        display: "none"
    })

    $("header").css({
        "background-color": "rgb(71, 78, 93)",
        transition: "400ms"
    })

    window.removeEventListener('keyup', logoutKeyListener)
    window.removeEventListener('keyup', removeCreditKeyListener)
    window.removeEventListener('keyup', addCreditKeyListener)
}

//################################################################
// Callbacks
//################################################################

// just creating functions instead of event handlers seems to work better if data needs to be passed
function onLogin(account){
    console.log(account)

    logoutTimeoutHandler = setTimeout(function(){
        var event = new Event('logout')
        window.dispatchEvent(event)
    },10000)

    updateAccountInfo(account)

    loggedInState()
}

function updateAccountInfo(account){
    viewModel.uid(account.tagID)
    viewModel.credit(account.credit + '€')  
}

window.addEventListener('logout', function(){

    viewModel.uid(undefined)
    viewModel.credit(undefined)

    loggedOutState()
});

window.addEventListener('keyup', debugLoginListener, true)

window.addEventListener('keyup', function(){
    clearTimeout(logoutTimeoutHandler)
    logoutTimeoutHandler = setTimeout(function(){
        var event = new Event('logout')
        window.dispatchEvent(event)
    },20000)
}, true)

/**
 * Shows debug login dialog circumventing the need for a tag reader
 */
async function onDebugLogin(){
    if (DEBUG){
        var {value : id} = await Swal({
            title: 'DEBUG: Enter ID',
            type: 'warning',
            showConfirmButton: true,
            input: 'text',
            inputPlaceholder: 'ID',
            inputAttributes: {
                autocapitalize: 'off',
                autocorrect: 'off'
            }
        })
    
        loginByUid(id)
        
    }
}

async function onAddCredit(){
    var {value : amount} = await Swal({
        title: 'Enter amount to add',
        type: 'question',
        showConfirmButton: true,
        input: 'number',
        inputPlaceholder: 'Amount',
        inputAttributes: {
            autocapitalize: 'off',
            autocorrect: 'off'
        }
    })

    amount = Number.parseInt(amount)
    if (amount >= 0 && amount != NaN){  // sane bounds check to prevent nonsens like NaN and negative numbers
        updateAccountInfo(await db.updateCredit(viewModel.uid(), amount))
    }   
}

async function onRemoveCredit(){
    var {value : amount} = await Swal({
        title: 'Enter amount to remove',
        type: 'question',
        showConfirmButton: true,
        input: 'number',
        inputPlaceholder: 'Amount',
        inputAttributes: {
            autocapitalize: 'off',
            autocorrect: 'off'
        }
    })

    amount = Number.parseInt(amount)
    if (amount >= 0 && amount != NaN){  // sane bounds check to prevent nonsens like NaN and negative numbers
        updateAccountInfo(await db.updateCredit(viewModel.uid(), -amount))
    }  
}

//################################################################
// SVG Replacer
//################################################################
jQuery('img.svg').each(function() {
    var $img = jQuery(this);
    var imgID = $img.attr('id');
    var imgClass = $img.attr('class');
    var imgURL = $img.attr('src');

    jQuery.get(imgURL, function(data) {
        // Get the SVG tag, ignore the rest
        var $svg = jQuery(data).find('svg');

        // Add replaced image's ID to the new SVG
        if (typeof imgID !== 'undefined') {
            $svg = $svg.attr('id', imgID);
        }
        // Add replaced image's classes to the new SVG
        if (typeof imgClass !== 'undefined') {
            $svg = $svg.attr('class', imgClass + ' replaced-svg');
        }

        // Remove any invalid XML tags as per http://validator.w3.org
        $svg = $svg.removeAttr('xmlns:a');

        // Replace image with new SVG
        $img.replaceWith($svg);

    }, 'xml');

});