import { LightningElement, track, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ConsultarCEP from "@salesforce/apex/ViaCEPController.chamarServico";
import UpdateAdderss from "@salesforce/apex/ViaCEPController.updateAccountAddress";

export default class ViaCEP extends LightningElement {
    @api recordId;
    @track loaded = true;
    @track address = {
        cep: '',
        bairro: '',
        logradouro: '',
        localidade: '',
        uf: '',
    };

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
            this.showToast('Atenção!', 'CEP incompleto para busca', 'info');
            return false;
        }
        
        this.loaded = false;

        ConsultarCEP({
            cep: this.address.cep
        }).then((response) => {
            
            if(!response.erro) {
                this.address = Object.assign({}, response);
            } else {
                this.showToast(
                    'Erro', 
                    'CEP não encontrado, favor preencher manualmente', 
                    'error'
                );
            }
            this.loaded = true;
        }).catch(error => {
            this.showToast(
                'Erro inesperado!', 
                'Tente novamente ou fale com um administrador', 
                'error'
            );
            this.loaded = true;
        });
    }

    handleSave() {
        if(!this.address.cep){
            this.showToast('Erro', 'Preencha o campo CEP', 'error');
            return false;
        }
        if(!this.address.logradouro){
            this.showToast('Erro', 'Preencha o campo Endereço', 'error');
            return false;
        }
        if(!this.address.bairro){
            this.showToast('Erro', 'Preencha o campo Bairro', 'error');
            return false;
        }
        if(!this.address.localidade){
            this.showToast('Erro', 'Preencha o campo Cidade', 'error');
            return false;
        }
        if(!this.address.uf){
            this.showToast('Erro', 'Preencha o campo Estado', 'error');
            return false;
        }

        this.loaded = false; 

        var account = {
            Id: this.recordId, 
            ShippingPostalCode: this.address.cep, 
            ShippingStreet: this.address.logradouro, 
            ShippingCity: this.address.localidade, 
            ShippingState: this.address.uf
        }

        UpdateAdderss({
            accountJSON: JSON.stringify(account)
        })
        .then(response => {
            if(response == 'success') {
                this.showToast('Sucesso', 'Endereço atualizado com sucesso!', 'success');
                eval("$A.get('e.force:refreshView').fire();");
            } else {
                this.showToast(
                    'Erro inesperado!', 
                    'Tente novamente ou fale com um administrador', 
                    'error'
                );
            }
            
            this.loaded = true;
        })
        .catch(error => {
            console.log(error);
            this.showToast(
                'Erro inesperado!', 
                'Tente novamente ou fale com um administrador', 
                'error'
            );
            this.loaded = true;
        });
    }
}