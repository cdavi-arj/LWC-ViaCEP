// LWC
import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { updateRecord } from 'lightning/uiRecordApi';
// Apex
import ConsultarCEP from "@salesforce/apex/ViaCEPController.chamarServico";
// Custom Labels
import CEP from "@salesforce/label/c.CEP";
import cidade from "@salesforce/label/c.Cidade";
import endereco from "@salesforce/label/c.Endereco";
import bairro from "@salesforce/label/c.Bairro";
import estado from "@salesforce/label/c.Estado";
import CEPIncompleto from "@salesforce/label/c.CEPIncompleto";
import CEPNaoEncontrado from "@salesforce/label/c.CEPNaoEncontrado";
import mensagemGenericaErro from "@salesforce/label/c.MensagemGenericaErro";
import preenchaCampo from "@salesforce/label/c.PreenchaCampo";
import erroInesperado from "@salesforce/label/c.ErroInesperado";
import erro from "@salesforce/label/c.Erro";
import atencao from "@salesforce/label/c.Atencao";
import sucesso from "@salesforce/label/c.Sucesso";
import enderecoAtualizadoSucesso from "@salesforce/label/c.EnderecoAtualizadoSucesso";
import btnSalvar from "@salesforce/label/c.BtnSalvar";

export default class ViaCEP extends LightningElement {

    @api recordId;
    @track loaded = true;
    @track showMap = false;
    @track address = {
        cep: '',
        bairro: '',
        logradouro: '',
        localidade: '',
        uf: '',
    };
    label = {
        CEP,
        cidade,
        endereco,
        bairro,
        estado,
        CEPIncompleto,
        CEPNaoEncontrado,
        mensagemGenericaErro,
        preenchaCampo,
        erroInesperado,
        erro,
        atencao,
        sucesso,
        enderecoAtualizadoSucesso,
        btnSalvar
    }
    @track mapMarkers = [
        {
            location: {
                Street: '',
                City: '',
                Country: '',
                PostalCode: '',
                State: ''
            },
            icon: 'standard:account'
        },
    ];

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title, message, variant
        });
        this.dispatchEvent(event);
    }

    handleFieldChange(event) {
        const field = event.target.name;
        if (field === 'cep') {
            this.address.cep = event.target.value;
        } else if (field === 'bairro') {
            this.address.bairro = event.target.value;
        } else if (field === 'cidade') {
            this.address.localidade = event.target.value;
        } else if (field === 'rua') {
            this.address.logradouro = event.target.value;
        } else if (field === 'uf') {
            this.address.uf = event.target.value;
        }
    }

    handleBlurCEP() {
        if(this.address.cep.length < 8){
            this.showToast(
                this.label.atencao, 
                this.label.CEPIncompleto, 
                'info'
            );
            return false;
        }

        this.loaded = false;
        this.showMap = false;

        ConsultarCEP({
            cep: this.address.cep
        }).then((response) => {
            
            if(!response.erro) {
                this.address = Object.assign({}, response);

                this.mapMarkers[0].location = {
                    Street: this.address.logradouro,
                    City: this.address.localidade,
                    Country: 'BR',
                    PostalCode: this.address.cep,
                    State: this.address.uf
                };
                
                this.showMap = true;
                
            } else {
                this.showToast(
                    this.label.erro, 
                    this.label.CEPNaoEncontrado, 
                    'error'
                );
            }
        }).catch(error => {
            this.showToast(
                this.label.erroInesperado, 
                this.label.mensagemGenericaErro, 
                'error'
            );
        }).finally(()=>{
            this.loaded = true;
        });
    }

    handleSave() {

        const inputs = this.template.querySelectorAll("lightning-input");
        var isValid = true;

        inputs.forEach(input=> {
            if (!input.validity.valid) {
                isValid = false;
                input.reportValidity();
            }
        });

        if (isValid) {

            this.loaded = false; 

            const account = {
                Id: this.recordId, 
                ShippingPostalCode: this.address.cep, 
                ShippingStreet: this.address.logradouro, 
                ShippingCity: this.address.localidade, 
                ShippingState: this.address.uf
            }

            updateRecord({ 
                fields: account
            })
            .then(response => {

                this.showToast(
                    this.label.sucesso, 
                    this.label.enderecoAtualizadoSucesso, 
                    'success'
                );

            })
            .catch(error => {

                console.log(error);

                this.showToast(
                    this.label.erroInesperado, 
                    this.label.mensagemGenericaErro, 
                    'error'
                );
                
            }).finally(()=> {
                this.loaded = true;
            });
        }
    }

}